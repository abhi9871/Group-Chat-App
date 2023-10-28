const Group = require('../models/group');
const User = require('../models/user');
const UserGroup = require('../models/usergroup');
const { Op } = require('sequelize');
const sequelize = require('../utils/database');

// Function for creating a group
const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body;
        const group = await Group.create({
            name: groupName || 'Group'    // It will take default value (Group) if it found falsy(null, undefined, '', NaN, false, 0)
        })
        if(group) {
            // Include the creator's user ID in the participants array
            const creatorUserId = req.user.id.toString();
            participants.push(creatorUserId);
            const isAdmin = [];
            await Promise.all(participants.map(async (userId) => {
                const user = await User.findByPk(Number.parseInt(userId));
                if (user) {
                    await group.addUser(user, { through: { isAdmin: userId === creatorUserId } }); // magic method by sequelize to insert into UserGroup table just like (await UserGroup.create({ UserId: user.id, GroupId: group.id }))
                    isAdmin.push({ userId, isAdmin: userId === creatorUserId });
                }
                console.log(group);
            }));
            res.status(200).json({ success: true, group, isAdmin });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
}

// Function for fetching all the groups
const getGroups = async (req, res) => {
    try {
        const userGroups = await UserGroup.findAll({ where: { userId: req.user.id }, include: [{ model: Group }], attributes: ['userId','isAdmin'] });
        const groups = userGroups.map(userGroup => {
            const groupData = userGroup.group.toJSON();
            return {
                ...groupData, // Spread operator to include all properties from groupData
                userId: userGroup.userId, // Add userId property into the groupData
                isAdmin: userGroup.isAdmin // Add isAdmin property into the groupData
            }
        });
        if(groups) {
            res.status(200).json({ success: true, groups });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
}

// Get members for group
 const getMembersForGroup = async (req, res) => {
    try {
        const groupId = req.query.groupId;
        const userGroups = await UserGroup.findAll({ where: { groupId: groupId }, include: [{ model: User, attributes: ['id', 'name'] }], attributes: ['isAdmin'] });
        const users = userGroups.map(userGroup => {
            const userData = userGroup.user.toJSON();
           return {
                ...userData,  // Spread operator to include all properties from userData
                isAdmin: userGroup.isAdmin // Add isAdmin property into the groupData
           }
        });
        if (users.length > 0) {
            res.status(200).json({ success: true, users });
        } else {
            res.status(404).json({ success: false, message: 'No members found for this group' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
 }

 // Is user admin or not
 const isUserAdmin = async (req, res) => {
    try {
        const { userId, groupId } = req.query;
        const currentUserAdmin = await UserGroup.findOne({ where: { userId: userId, groupId: groupId }, attributes: ['isAdmin'] });
        res.status(200).json({ success: true, currentUserAdmin });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
 }

// Make an admin of the group
const makeAdmin = async (req, res) => {
    try {
        const { userId, groupId} = req.query;
        const admin = await UserGroup.update({ isAdmin: true }, { where: { userId: userId, groupId: groupId } });
        if(admin) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Error while making this member admin' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ sucess: false, message: 'Something went wrong' });
    }
}

// Remove member from the group
const removeMember = async (req, res) => {
    try {
        const { userId, groupId } = req.query;
        const userInstance = await User.findByPk(userId);
        const groupInstance = await Group.findByPk(groupId);

        // Check if the user and group exist
        if (!userInstance || !groupInstance) {
            return res.status(404).json({ success: false, message: 'User or Group not found' });
        }

        // Remove the association
        await userInstance.removeGroup(groupInstance); // Remove from the UserGroup junction table

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ sucess: false, message: 'Something went wrong' });
    }
}

// Get participants for adding into the existing group
const getParticipants = async (req, res) => {
    try {
        const groupId = req.query.groupId;
        const users = await User.findAll({ where: { id: { [Op.not]: [
            sequelize.literal(`(
                SELECT userId
                FROM UserGroups 
                WHERE groupId = ${groupId}
            )`)
        ] } }, attributes: ['id', 'name', 'email'] });
        if(users){
            res.status(200).json({ success: true, users});
        } else {
            res.status(400).json({ success: false, message: 'No participants' });
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ sucess: false, message: 'Something went wrong' });
    }
}

// Add participants to the existing group
const addParticipantsToExistingGroup = async (req, res) => {
    try {
        const { participants } = req.body;
        const groupId = req.query.groupId;
        const group = await Group.findByPk(groupId);
        if(group) {
            await Promise.all(participants.map(async (userId) => {
                const user = await User.findByPk(Number.parseInt(userId));
                if (user) {
                    await group.addUser(user); // magic method by sequelize to insert into UserGroup table just like (await UserGroup.create({ UserId: user.id, GroupId: group.id }))
                }
            }));
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Group not found' });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
}

module.exports = {
    createGroup,
    getGroups,
    getMembersForGroup,
    isUserAdmin,
    makeAdmin,
    removeMember,
    getParticipants,
    addParticipantsToExistingGroup
}
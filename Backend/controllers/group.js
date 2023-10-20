const Group = require('../models/group');
const User = require('../models/user');
const UserGroup = require('../models/usergroup');

// Function for creating a group
const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body;
        const group = await Group.create({
            name: groupName
        })
        if(group) {
            // Include the creator's user ID in the participants array
            const creatorUserId = req.user.id;
            participants.push(creatorUserId);
            await Promise.all(participants.map(async (userId) => {
                const user = await User.findByPk(Number.parseInt(userId));
                if (user) {
                    await group.addUser(user);  // magic method by sequelize to insert into UserGroup table just like (await UserGroup.create({ UserId: user.id, GroupId: group.id });)
                }
            }));
            res.status(200).json({ success: true, group });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
}

// Function for fetching all the groups
const showGroups = async (req, res) => {
    try {
        const userGroups = await UserGroup.findAll({ where: { userId: req.user.id }, include: [{ model: Group }] });
        const groups = userGroups.map(userGroup => userGroup.group);
        if(groups) {
            res.status(200).json({ success: true, groups });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
        console.log(err);
    }
}

module.exports = {
    createGroup,
    showGroups
}
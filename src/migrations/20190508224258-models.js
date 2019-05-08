module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                default: false,
                allowNull: false,
            },
            createdAt: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
            updatedAt: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
        });
        await queryInterface.addIndex('Users', ['username']);
        await queryInterface.addIndex('Users', ['isActive']);
        await queryInterface.addIndex('Users', ['createdAt']);
        await queryInterface.addIndex('Users', ['updatedAt']);

        await queryInterface.createTable('AccessTokens', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            token: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            refreshToken: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            expires: {
                type: 'TIMESTAMP',
                allowNull: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                allowNull: false,
            },
            consumed: {
                type: Sequelize.BOOLEAN,
                default: false,
                allowNull: false,
            },
            createdAt: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
            updatedAt: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false,
            },
        });
        await queryInterface.addIndex('AccessTokens', ['token']);
        await queryInterface.addIndex('AccessTokens', ['refreshToken']);
        await queryInterface.addIndex('AccessTokens', ['userId']);
        await queryInterface.addIndex('AccessTokens', ['expires']);
        await queryInterface.addIndex('AccessTokens', ['consumed']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Users');
        await queryInterface.dropTable('AccessTokens');
    },
};

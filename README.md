[![Build Status](https://travis-ci.com/evenset/safe-auth-sequelize.svg?branch=development)](https://travis-ci.com/evenset/safe-auth-sequelize)
[![codecov](https://codecov.io/gh/evenset/safe-auth-sequelize/branch/development/graph/badge.svg)](https://codecov.io/gh/evenset/safe-auth-sequelize)
[![npm version](https://badge.fury.io/js/safe-auth-sequelize.svg)](https://badge.fury.io/js/safe-auth-sequelize)

# What's safe-auth-sequelize
It's [Sequelize](https://github.com/sequelize/sequelize) adapter for
[safe-auth](https://github.com/evenset/safe-auth). So it enables Postgres,
MySQL, MariaDB, SQLite and Microsoft SQL Server database engines for safe-auth
as its storage backend.
It's written in TypeScript with %100 test code coverage.

# Requirements

safe-auth-sequelize needs and is tested against Sequelize 5.1 or higher

# How to use

It provides a function that should be called with an instance of sequelize:

```typescript
import {SequelizeAccessToken, SequelizeUser} from 'safe-auth-sequelize';
```

Models should get initialized (like any other sequelize model) before being
used. Initialization can be done explicitly:

```typescript
SequelizeUser.init({}, {sequelize});
SequelizeAccessToken.init({}, {sequelize});
SequelizeUser.associate(sequelize.models);
SequelizeAccessToken.associate(sequelize.models);
```

or if there's a script that automates this process for all sequelize models, it
should work for these two models too and manual initialization won't be
required.

## Extending models

Most of the time it's needed to extend the `SequelizeUser` model (or even the
`SequelizeAccessToken` model), to do so new classes should be defined extending
the code classes of safe-auth-sequelize. Also the core class shouldn't get
initialized and the initialization should happen for the inherited class
instead.

For example here a `User` class is inheriting from the core `SequelizeUser`
class. It's connected to a `Organization` model.

```typescript
import {SequelizeAccessToken, SequelizeUser} from 'safe-auth-sequelize';

class Organization extends Sequelize.Model {
    public id!: number;
    public name!: string;
}
Organization.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
    },
}, {sequelize})
// Organization doesn't have an associate method

class User extends SequelizeUser {
    public firstname!: string;
    public lastname!: string;
    public organization!: Organization // A class in your codebase

    public static associate(models: {
        User?: typeof SequelizeUser;
        AccessToken?: typeof SequelizeAccessToken;
    }): void {
        super.associate();
        SequelizeAccessToken.belongsTo(Organization, {
            as: 'organization',
            foreignKey: 'organizationId',
            targetKey: 'id',
        });
    }
}

User.init({
    firstname: {
        type: new DataTypes.STRING(128),
        allowNull: false,
    },
    lastname: {
        type: new DataTypes.STRING(128),
        allowNull: false,
    },
}, {sequelize})
SequelizeAccessToken.init({}, {sequelize});
User.associate(sequelize.models);
SequelizeAccessToken.associate(sequelize.models);
```

Note that you don't need to define internal fields of safe-auth-sequelize,
you just need to define your own custom fields in the `init` function call
(here `firstname` and `lastname`).

### Migrations

We provide a sample migration in the github repository, you can download it to
your migrations directory.
You need to modify it in case you're extending (inheriting from) the default
models.


# Reporting bugs

You can report issues/bugs in the github repository of the project:
https://github.com/evenset/safe-auth-sequelize/issues

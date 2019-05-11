[![Build Status](https://travis-ci.com/evenset/safe-auth-sequelize.svg?branch=development)](https://travis-ci.com/evenset/safe-auth-sequelize)
[![codecov](https://codecov.io/gh/evenset/safe-auth-sequelize/branch/development/graph/badge.svg)](https://codecov.io/gh/evenset/safe-auth-sequelize)
[![npm version](https://badge.fury.io/js/safe-auth-sequelize.svg)](https://badge.fury.io/js/safe-auth-sequelize)

# What's safe-auth-sequelize
It's [Sequelize](https://github.com/sequelize/sequelize) adapter for
[safe-auth](https://github.com/evenset/safe-auth). So it enables Postgres,
MySQL, MariaDB, SQLite and Microsoft SQL Server database engines for safe-auth
as its storage backend.
It's written in TypeScript with %100 test code coverage.

# How to use

It provides a function that should be called with an instance of sequelize:

```typescript
import {SequelizeAccessToken, SequelizeUser} from 'safe-auth-sequelize';
```

You need to initialize these models before using them.

```typescript
SequelizeUser.init({}, {sequelize});
SequelizeAccessToken.init({}, {sequelize});
SequelizeUser.associate();
SequelizeAccessToken.associate();
```

Note that this is the same for all other sequelize models, safe-auth-sequelize
can't do it by itself because the initialization process needs an instance of
Sequelize.

If you are using the general sequelize importing script and it runs after
initalizing these models, you don't need to call `associate` as that script
does it for you.

Each of these two models implement the corresponding safe-auth model and
Sequelize model at the same time, so they store stuff in the database the
`sequelize` instance is connected to.

Alternatively you can extend one or both of the models by inheriting them. In
this case you should not initialize the imported model that you are inheriting
from and instead you should initialize the inherited model, for example here we
inherit from `User` model and use the original `AccessToken` model, the
inherited `User` model is connected to a `Organization` model that's not in the
code snippet below:

```typescript
import {SequelizeAccessToken, SequelizeUser} from 'safe-auth-sequelize';

class User extends SequelizeUser {
    public firstname!: string;
    public lastname!: string;
    public organization!: Organization // A class in your codebase

    public static associate(): void {
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
User.associate();
SequelizeAccessToken.associate();
```

Note that you don't need to define internal fields of safe-auth-sequelize,
you just need to define your own custom fields in the `init` function call.

### Migrations

We provide a sample migration in the github repository, you can download it to
your migrations directory.
You need to modify it in case you're extending (inheriting from) the default
models.


# Reporting bugs

You can report issues/bugs in the github repository of the project:
https://github.com/evenset/safe-auth-sequelize/issues

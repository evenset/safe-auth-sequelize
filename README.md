[![Build Status](https://travis-ci.org/evenset/safe-auth-sequelize.svg?branch=development)](https://travis-ci.org/evenset/safe-auth-sequelize)
[![codecov](https://codecov.io/gh/evenset/safe-auth-sequelize/branch/development/graph/badge.svg)](https://codecov.io/gh/evenset/safe-auth-sequelize)

# What's safe-auth-sequelize
It's [Sequelize](https://github.com/sequelize/sequelize) adapter for
[safe-auth](https://github.com/evenset/safe-auth). So it enables Postgres,
MySQL, MariaDB, SQLite and Microsoft SQL Server database engines for safe-auth
as its storage backend.
It's written in TypeScript with %100 test code coverage.

# How to use

It provides a function that should be called with an instance of sequelize:

```typescript
import safeAuthSequelize from 'safe-auth-sequelize';
```

It then returns a JS object that provides two models:

```typescript
const {SequelizeAccessToken, SequelizeUser} = safeAuthSequelize(sequelize);
```

Each of these two models implement the corresponding safe-auth model and
Sequelize model at the same time, so they store stuff in the database the
`sequelize` instance is connected to.


# Reporting bugs

You can report issues/bugs in the github repository of the project:
https://github.com/evenset/safe-auth-sequelize/issues

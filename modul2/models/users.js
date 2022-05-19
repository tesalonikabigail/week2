const { Model } = require('objection')
const knex = require('../config/knex') //import

Model.knex(knex)

class Users extends Model { //'Users' nya bebas namanya
    static get tableName(){
        return 'users'
    }
}

module.exports = Users //biar bisa di pke di file lain
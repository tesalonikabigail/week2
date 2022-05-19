const { Model } = require('objection')
const knex = require('../config/knex')

Model.knex(knex)

class Messages extends Model {
    static get tableName(){
        return 'messages'
    }

    //biar tau klo table Messages terhubung sm table Users lewat foreign key nim
    static get relationMappings(){ //krna ada foreign key
        const Users = require('./users') //buat tau reference nya kmn
        return {
            users:{
                relation: Model.HasManyRelation,
                modelClass: Users,
                join:{
                    from: 'messages.nim',
                    to: 'users.nim'
                }
            }
        }
    }
}

module.exports = Messages



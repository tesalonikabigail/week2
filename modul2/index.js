// npm install --save-dev nodemon
// dev: nodemon index.js -> npm run dev

// Foreign key
/* 
   ALTER TABLE messages
   ADD FOREIGN KEY (nim) REFERENCES users(nim)
*/

const express = require('express')
const app = express()
const cors = require('cors') // npm install cors

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

//CRUD users
const UsersDB = require('./models/users')

//GET -> Read
app.get('/api/users', async(req, res) => {
    // UsersDB.query().then((result) => {
    //     res.send(result)
    // })

    const result = await UsersDB.query() //biar nunggu smpai proses line ini slsai baru 
    return res.send(result) //lanjut proses line stlhnya
})
app.get('/api/users/:nim', async(req, res) => {
    const nim = req.params; //msh dalam bntuk JSON bkn string NIM nya doang
    const db = await UsersDB.query()

    if(db.find(i => i.nim == parseInt(nim.nim)) ? true : false){
        const result = await UsersDB.query().where({
            nim: nim.nim
        })
        
        return res.send(result)
    }
    else
        return res.send({message: 'NIM ' + nim.nim + ' tidak ditemukan'})
})

//POST -> Create
app.post('/api/users', async(req, res) => {
    // const data = req.body
    // await UsersDB.query().insert({
    //     nim: data.nim, //msh dlm JSON mknya hrs di .nim (nama kolom di table db nya)
    //     name: data.name
    // })

    //Cara ES6
    const {nim, name} = req.body //jadi ga perlu pke .nim dan .name lagi
    await UsersDB.query().insert({
        nim: nim, //langsung nama nya aja
        name: name
    })

    return res.send({message: 'Data Berhasil Ditambahkan'})
})

//PUT -> Update
app.put('/api/users/:nim', async(req, res) => {
    const params = req.params; //dptin data yg mw di update
    const {name} = req.body; //nim nya ga usah diambil (di centang) krna primary key
    const db = await UsersDB.query()

    if(db.find(i => i.nim === parseInt(params.nim) ? true : false)){
        await UsersDB.query().update({
            //nim: nim -> gjd krna kan nim itu primary jadi ga blh diganti mknya ga diambil
            name: name
        }).where({ nim: params.nim })

        return res.send({message: 'Data Berhasil Diupdate'})
    }
    else
        return res.send({message: 'NIM ' + params.nim + ' tidak ditemukan'})
})

//DELETE -> Delete
app.delete('/api/users/:nim', async(req, res) => {
    const {nim} = req.params;
    const db = await UsersDB.query()

    if(db.find(i => i.nim === parseInt(nim) ? true : false)){
        await UsersDB.query().delete().where({
            nim: nim
        })

        return res.send({message: 'Data Berhasil Dihapus'})
    }
    else
        return res.send({message: 'NIM ' + nim + ' tidak ditemukan'})
})


//CRUD messages
const messagesDB = require('./models/messages')

// GET
app.get('/api/messages', async(req, res) => {
    const result = await messagesDB.query()
    return res.send(result)
})
app.get('/api/messages/:nim', async(req, res) => {
    //const nim = req.params
    const { nim } = req.params
    const db2 = await messagesDB.query()

    if(db2.find(i => i.nim === parseInt(nim) ? true : false)){
        const result = await messagesDB.query().where({
            //nim: nim.nim
            nim: nim
        })

        return res.send(result)
    }
    else
        return res.send({message: 'NIM ' + nim + ' tidak ditemukan'})
})

// Message Details include name with JOIN ORM
// https://vincit.github.io/objection.js/recipes/joins.html
app.get('/api/messageDetails', async(req, res) => {
/*   const people = await Person.query()
    .select('persons.*', 'parent.firstName as parentName')
    .join('persons as parent', 'persons.parentId', 'parent.id');
*/  
    const result = await messagesDB.query()
            .select( //namaTable.namaKolom as namaAlias
                'messages.nim as nim', 'messages.message as message', 'users.name as name')
            .join( //Table yg di join, join nya berdasarkan apa yang sama kyk di db biasa
                'users','users.nim', 'messages.nim'
            );
    
    return res.send(result)
})
app.get('/api/messageDetails/:nim', async(req, res) => {
    const { nim } = req.params //buat di pke di WHERE nya ambil nim dari parameter dlu
    //const nim = req.params
    const db2 = await messagesDB.query()

    if(db2.find(i => i.nim === parseInt(nim) ? true : false)){
        const result = await messagesDB.query()
                .select(
                    'messages.nim as nim', 'messages.message as message', 'users.name as name'
                )
                .join(
                    'users', 'users.nim', 'messages.nim' // Sama aja kyk ON nya db; FROM messages AS m JOIN users AS u ON(u.EmployeeID = m.ManagerID)
                )
                .where({ 'messages.nim': nim }); //hrs pke { } kyk biasa klo ga error merah; 'messages.nim':nim.nim
        
        return res.send(result)
    }
    else
        return res.send({message: 'NIM ' + nim + ' tidak ditemukan'})
})

// POST
app.post('/api/messages', async(req, res) => {
    const { nim, message } = req.body
    const db = await UsersDB.query()
    const db2 = await messagesDB.query()

    if(!db.find(i => i.nim === parseInt(nim) ? true : false))
        return res.send({message: 'NIM ' + nim + ' tidak ditemukan, jadi message tidak dapat diinput'})
    else if(db2.find(i => i.nim === parseInt(nim) ? true : false))
         return res.send({message: 'Message milik NIM ' + nim + ' sudah ada'})

    // -- Cara FOR biasa buat IF --
    // for(let i = 0; i < db.length; i++){
    //     if(db[i].nim === parseInt(nim)){ //di parse ke int karena nim yg { nim } itu string :') jadi ktmu sm db[i].nim krna di db nim itu int
    //         console.log('masuk')
    //         cek = 1
    //     }
    // }

    // -- Cara FOR biasa buat ELSE IF --
    // for(let i = 0; i < db2.length; i++){
    //     if(db2[i].nim === parseInt(nim)){ //message nya udh ada
    //         console.log('masuk')
    //         cek = 1 //1 = udh ada
    //         break
    //     }
    // }
    
    await messagesDB.query().insert({ 
        nim: nim,
        message: message
    })

    return res.send({message: 'Data Berhasil Ditambahkan'})
})

// PUT 
app.put('/api/messages/:nim', async(req, res) => {
    const dataIn = req.params //dri url
    const { message } = req.body //dari form input nya
    const db2 = await messagesDB.query()

    if(db2.find(i => i.nim === parseInt(dataIn.nim) ? true : false)){
        await messagesDB.query().update({
            message: message
        }).where({ nim: dataIn.nim })

        return res.send({message: 'Data Berhasil Diupdate'})
    }
    else
        return res.send({message: 'NIM ' + dataIn.nim + ' tidak ditemukan'})
})

// DELETE
app.delete('/api/messages/:nim', async(req, res) => {
    const dataIn = req.params
    const db2 = await messagesDB.query()

    if(db2.find(i => i.nim === parseInt(dataIn.nim) ? true : false)){
        await messagesDB.query().delete().where({
            nim: dataIn.nim //Not ES6, sengaja ka biar ga lupa yg ES6 nya ada di yang lain
        })

        return res.send({message: 'Data Berhasil Dihapus'})
    }
    else
        return res.send({message: 'NIM ' + dataIn.nim + ' tidak ditemukan'})
})

const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log(`Server running on port ${ PORT }`)
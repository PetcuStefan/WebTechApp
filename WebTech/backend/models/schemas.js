const mongoose=require('mongoose')
const Schema=mongoose.Schema

const studentSchema=new Schema({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    profEmail:{type:String, default:''},
    hasNewUpload:{type:Boolean, default:false},
    isFinal:{type:Boolean, default:false}
})

const professorSchema=new Schema({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true}
})

const sessionsSchema=new Schema({
    sessionId:{type:String, required:true},
    profEmail:{type:String, required:true, ref: 'Professors'},
    maxStudents:{type:Number, required:true},
    studentEmails:{type:[String], default: []},
    studentsWhoWantToEnroll:{type:[String], default:[]}
    }
)

const requestsSchema=new Schema({
    studentEmail:{type:String, required:true},
    filePath:{type: String, required:true}
})

const Students=mongoose.model('Students',studentSchema,'Students')
const Professors=mongoose.model('Professors',professorSchema,'Professors')
const Sessions = mongoose.model('Sessions', sessionsSchema, 'Sessions');
const Requests=mongoose.model('Requests',requestsSchema,'Requests')
const mySchemas = { Students, Professors, Sessions, Requests };
module.exports=mySchemas
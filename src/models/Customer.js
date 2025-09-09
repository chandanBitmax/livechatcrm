const mongoose=require("mongoose");

const CustomerSchema=new mongoose.Schema({
    name:  {
      type: String,
      required: true,
      trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    password:{
        type:String,
        required:true,
    },
    is_active:{
      type:Boolean,default:false
    },
    is_typing:{
        type:Boolean, default: false
    },

},{timestamps:true});

module.exports=mongoose.model("Customer",CustomerSchema);
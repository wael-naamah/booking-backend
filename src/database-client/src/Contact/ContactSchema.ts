import mongoose from "mongoose";


export const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    salutation: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    zip_code: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    phone_numbber_2: String,
    phone_numbber_3: String,
    contract_link: String,
    email: {
      type: String,
      required: true,
    }, 
    password: {
      type: String,
      required: false,
    },
    // unique: true, TODO: need to discuss the requirements
    note_on_address: String,
    newsletter: Boolean,
    categories_permission: [{type: String, required: false}],
    remarks: String,
    imported: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

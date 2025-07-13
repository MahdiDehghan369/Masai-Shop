const { isValidObjectId } = require('mongoose');
const ContactModel = require('./../models/contactModel');
const UserModel = require('./../models/userModel');

const sendAnswerContact = require('./../configs/sendContactAnswer');


exports.sendMessage = async(req, res, next) => {
    try {
        const {fullName , email, subject, message} = req.body

        const contact = await ContactModel.create({
          fullName,
          email,
          subject,
          message,
        });

        return res.status(200).json({
            success: true,
            contact
        })

    } catch (error) {
        next(error)
    }
}

exports.getAllContacts = async(req, res, next) => {
    try {
        const { status, answerBy, page = 1, limit = 10 } = req.query;

        let query = {}

        if(status){
            query.status = status
        }

        if(answerBy){
            if(!isValidObjectId(answerBy)){
                return res.status(422).json({success: false, message: "Admin ID is not valid"})
            }

            const admin = await UserModel.findOne({_id: answerBy , role: "admin"})

            if(!admin){
                return res
                  .status(404)
                  .json({ success: false, message: "Admin not found" });
            }

            query.answerBy = answerBy
        }


        const contacts = await ContactModel.find({ ...query })
          .populate("answerBy", "firstname , lastname , email")
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .lean();


        return res.status(200).json({
          success: true,
          contacts,
          pagination: {
            page,
            limit,
          },
        });

    } catch (error) {
        next(error)
    }
}

exports.getContactInfo = async(req, res, next) => {
    try {
        
        const {id} = req.params

        if(!isValidObjectId(id)){
            return res.status(422).json({
                success: false,
                message: "Contact ID is not valid"
            })
        }

        const contact = await ContactModel.findOne({_id: id}).populate("answerBy" , "firstname , lastname , email")

        if(!contact){
            return res.status(422).json({
              success: false,
              message: "Contact Not Found",
            }); 
        }

        if (contact.status === "pending"){
            contact.status = "seen"
            await contact.save()
        }
          return res.status(200).json({
            success: true,
            contact,
          });

    } catch (error) {
        next(error)
    }
}

exports.removeContact = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Contact ID is not valid",
          });
        }

        const contact = await ContactModel.findOneAndDelete({ _id: id })

        if (!contact) {
          return res.status(422).json({
            success: false,
            message: "Contact Not Found",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Contact removed successfully ",
        });
    } catch (error) {
        next(error)
    }
}

exports.answer = async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(422).json({
            success: false,
            message: "Contact ID is not valid",
          });
        }

        const contact = await ContactModel.findOne({ _id: id });

        if (!contact) {
          return res.status(422).json({
            success: false,
            message: "Contact Not Found",
          });
        }

        const { message } = req.body;

        const emailSent = await sendAnswerContact(
          contact.email,
          contact.fullName,
          contact.subject,
          message
        );

        if (!emailSent) {
          return res.status(500).json({
            success: false,
            message: "Failed to send email. Please try again later.",
          });
        }


        contact.answerBy = req.user.id
        contact.status = "replied";
        contact.answer = message
        contact.repliedAt = new Date()

        await contact.save()

        return res.status(200).json({
            success: true,
            message: "Answer sent successfully ✅"
        })


    } catch (error) {
        next(error)
    }
}
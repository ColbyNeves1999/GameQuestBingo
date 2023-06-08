import Joi from "joi";
import { makeValidator } from "../utils/makeValidator";

const newUserObj = Joi.object({

    title: Joi.string()
        .lowercase()
        .required(),

    objective: Joi.string()
        .lowercase()
        .required(),

});

const validateNewUserObj = makeValidator(newUserObj, 'body');

export { validateNewUserObj };
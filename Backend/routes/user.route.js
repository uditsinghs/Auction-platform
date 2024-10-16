import express from 'express'
import { register } from '../controllers/user.controller.js'


const route = express.Router()
route.post("/register",register)

export default route
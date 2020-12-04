import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import { getTokenFrom } from "../utils/auth.js"
import Order from "../models/order.js"

// description: to add order
// route: POST api/orders
export const addOrderItem = asyncHandler(async (request, response) => {
    // destructure the data from the request body
    const {
        cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = request.body

    // get the token from the request
    const token = getTokenFrom(request)

    // then decode the token to know the user id
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    // if the token is missing or invalid the code will stop exucting in the line above
    // and this generating an error, and errorHandler will respond with appropriate status code and error message

    // checks if there is no items
    if (cartItems && cartItems.length === 0) {
        return response.status(400).json({ error: "No order Items" })
    } else {
        // if not save the order to the database
        const createdOrder = await Order.create({
            orderItems: cartItems,
            user: decodedToken.id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        })

        // if order saved successfully return the order object
        if (createdOrder) {
            return response.status(201).json(createdOrder)
        } else {
            // if not return an error
            return response.status(400).json({ error: "Unable to create this order" })
        }
    }
})

// description: to get order by id
// route: GET api/orders/:id
export const getOrderById = asyncHandler(async (request, response) => {
    // get the token from the request
    const token = getTokenFrom(request)

    // then decode the token to know the user id, actulay I don't need it to search for the user because populate
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    // if the token is missing or invalid the code will stop exucting in the line above
    // and this generating an error, and errorHandler will respond with appropriate status code and error message

    // you can check the docs to know more about populate: https://mongoosejs.com/docs/populate.html
    const order = await Order.findById(request.params.id).populate("user", "name email")

    if (order) {
        response.json(order)
    } else {
        response.status(404)
    }
})
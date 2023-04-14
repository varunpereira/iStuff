import {write, db, env, res} from "~/config/store"
import crypt from "bcryptjs"
import jwt from "jsonwebtoken"
import user_model from "~/config/db/model/user"
import order_model from "~/config/db/model/order"

export var POST = async ({request}) => {
	var {email, password, confirm_password} = await request.json()
	db()

	var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s:])([^\s]){8,}$/gm
	if (!regex.test(password)) {
		return res({
			error:
				"Password must have at least 8 chars, 1 digit, 1 lower and upper case letter, 1 spesh char.",
		})
	}

	if (password !== confirm_password) {
		return res({error: "Passwords must match."})
	}

	var get_user = await user_model.findOne({email})
	if (get_user != null) {
		return res({
			error: "This email already exists.",
		})
	}

	var password_hash = crypt.hashSync(password, 12)

	var put_user = await new user_model({
		email,
		password: password_hash,
	}).save()
	var put_cart = await new order_model({
		email,
		current: true,
	}).save()

	// sign in
	var token = jwt.sign({email}, env.VITE_sesh, {
		expiresIn: "1d",
	})
	// save token to db for the user
	var user = await user_model.findOneAndUpdate(
		{email},
		{
			$set: {
				token,
			},
		},
	)
	var value = {email, token}
	var age = 10 * 60 // 10 min
	var cart = await order_model.findOne({
		email,
		current: true,
	})
	return res({ok: true, user, cart_size: cart.size}, {cookie: {value, age}})
}
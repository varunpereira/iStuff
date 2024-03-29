import {write, env, res, cookie} from "~/be/config/shop"
import crypt from "bcryptjs"
import jwt from "jsonwebtoken"
import user_model from "~/be/config/db/model/user"
import {db} from "~/be/config/db/join"

export var POST = async ({request}) => {
	var cookies = cookie(request.headers)
	var {email, password} = await request.json()
	db()
	var get_user = await user_model.findOne({email})
	if (get_user == null) {
		return res({
			error: "This user does not exist.",
		})
	}
	var password_match = crypt.compareSync(password, get_user.password)
	if (password_match === false) {
		return res({
			error: "Password incorrect.",
		})
	}
	var token = jwt.sign({email}, env.VITE_sesh, {
		expiresIn: "1d",
	})
	// save token to db for the user
	var set_user = await user_model.updateOne(
		{email},
		{
			$set: {
				token,
			},
		},
	)
	var value = {email, token, pub: cookies?.email}
	var age = 10 * 60 // 10 min
	return res({}, {cookie: {value, age}})
}

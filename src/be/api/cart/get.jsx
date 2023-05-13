import {write, env, res, cookie} from "~/be/config/shop"
import order_model from "~/be/config/db/model/order"
import {db} from '~/be/config/db/join'

export var POST = async ({request}) => {
	var {email} = cookie(request?.headers?.get("cookie"))
  db()
	
	var cart = await order_model.findOne({
		email,
		current: true,
	})

	return res({
		cart,
	})
}
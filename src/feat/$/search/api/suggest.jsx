import {write, db, env, res, num, math} from "~/config/store"
import prod_model from "~/config/db/model/prod"

export var POST = async ({request}) => {
	var {search, theme, page} = await request.json()
	search = search.trim()
	page = num(page)
	var prod = []
	db()
	if (theme === "all") {
		prod = await prod_model.find({
			title: {$regex: search, $options: "i"},
			approve: "true",
		})
	} else if (theme === "tech") {
		prod = await prod_model.find({
			title: {$regex: search, $options: "i"},
			theme: "tech",
			approve: "true",
		})
	}
	var prod_per_page = 8
	var pages = math.ceil(prod.length / prod_per_page)
	var lower = prod_per_page * (page - 1)
	var upper = prod_per_page * page
	prod = prod.slice(lower, upper)

	return res({
		pages,
		prod,
	})
}
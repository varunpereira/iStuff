import {
	state,
	react,
	write,
	d,
	t,
	b,
	i,
	route,
	globe,
	req,
	page,
	str,
	nav_full,
} from "~/fe/config/shop"
import {cut_icon} from "~/fe/config/asset/icon"

export default () => {
	var nav = route()
	var cart = state({})
	var flaw = state()

	var mount = async () => {
		var res = await req("/cart/get")
		return cart(res.cart)
	}

	var cut = async (prod) => {
		var res = await req("/cart/cut", {
			prod,
		})
		if (res?.error != null) {
			return
		}
		cart(res.cart)
		globe({...globe(), cart_size: (globe().cart_size -= prod.size)})
	}

	var put = async (prod) => {
		if (prod.stock === 0) {
			return flaw("This product is out of stock.")
		}
		var res = await req("/cart/put", {
			prod,
			prod_size: prod.size,
		})
		if (res?.error != null) {
			return
		}
		cart(res.cart)
		globe({...globe(), cart_size: (globe().cart_size += prod.size)})
	}

	var pay = async () => {
		if (cart().size <= 0) {
			return flaw("Cart empty. Please add a product.")
		}
		var prod = cart().prod.map((v) => {
			return {
				name: v.title,
				description: v._id,
				amount: v.price * 100,
				quantity: v.size,
				currency: "aud",
			}
		})
		var res = await req("/cart/stripe", {
			prod,
		})
		write(res)
		nav_full(res?.sesh?.url)
	}

	return page(
		{
			title: () => "Cart",
			status: () => "pub",
			mount,
			style: () => "fit_1 c_white tc_black p-[2rem]",
		},
		t({style: () => "ts_4 tw_2 mb-[2rem]"}, () => "Cart: " + cart()?.size + " products"),
		() =>
			cart()?.prod?.map((v, k) =>
				d(
					{style: () => "a_row_auto mb-[2rem]"},
					t({style: () => "w-[20rem]"}, () => v.title),
					d({style: () => "w-[7rem]"}, "-" + v.size + "+"),
					t({style: () => "w-[7rem]"}, () => "$" + v.price),
					b({click: () => cut(v)}, cut_icon({style: () => "w-[1.4rem] h-[1.4rem] hover:tc_grey"})),
				),
			),
		t({style: () => "ts_4 tw_2 mb-[2rem]"}, () => "Total: $" + cart()?.price),
		b({click: pay, style: () => "r_1 p-[.5rem] c_black tc_white"}, () => "Pay"),
		t({style: () => "mt-[2rem] tc_red h-[2rem]"}, () => flaw()),
	)
}

import {
	title,
	state,
	react,
	mount,
	clean,
	write,
	d,
	t,
	i,
	b,
	route,
	db,
	env,
	globe,
	auth,
	effect,
} from "~/config/store"
import cookie from "js-cookie"
import axios from "axios"
import user_model from "~/config/db/model/user"
// import {go} from '~/config/struct'
import {createSignal, createEffect, onMount, onCleanup, createResource} from "solid-js"
import server$ from "solid-start/server"
import mongoose from "mongoose"
import {redirect} from "solid-start/server"

const getuser = async () => "hey"
// (await fetch(`https://swapi.dev/api/people/${id}/`)).json();

export default () => {
	var nav = route()
	var form_error = state()
	var form_data = state({email: "", password: ""})
	var user = state("init")
	// user_model.live()?.on("change", async (change) => {
		// await fetch("http://localhost:5000/hi")
		// redirect('/oook')
		// set cookie here, fresh to t
	// })
	// use create resource? since it runs on server or redirect to refresh page
	// which will get data again, u can access state here
	
	// var usere = createResource(res, getuser)
	// react(() => write(user()))

	mount(async () => {
		await auth(cookie.get("email"), "public")
	})

	var form_submit = async () => {
		// go('/haha')
		var res = await axios.post("/$/login/api/auth_put", form_data())
		if (res?.data.error != null) {
			form_error(res.data.error)
			return
		}
		// set globe (fe cookie)
		// cookie?.set("email", form_data().email)
		// nav("/")
	}

	return d(
		{},
		title({value: () => "Sign in"}),
		d(
			{style: () => "w-[20rem] mx-[auto] p-[3rem] c_white tc_black r_1 a_col "},
			t({style: () => "ts_1 tw_1 mb-[1rem]"}, () => "Sign in"),
			i({
				type: () => "text",
				value: () => form_data().email,
				input: (e) => {
					e.preventDefault()
					return form_data({...form_data(), email: e.target.value})
				},
				holder: () => "Email",
				style: () => "mb-[1rem] h-[2rem] px-[.5rem] tc_black bw_1 bc_black r_1",
			}),
			i({
				type: () => "password",
				value: () => form_data().password,
				input: (e) => {
					e.preventDefault()
					return form_data({...form_data(), password: e.target.value})
				},
				holder: () => "Password",
				style: () => "mb-[2rem] h-[2rem] px-[.5rem] tc_black bw_1 bc_black r_1",
			}),
			b(
				{click: form_submit, style: () => "mb-[1.5rem] h-[2rem] c_orange bw_1 bc_black r_1 "},
				t({}, () => "Sign in"),
			),
			t({style: () => "tc_red h-[2rem]"}, () => form_error()),
		),
		d(
			{style: () => "w-[20rem] mx-[auto] a_row ax_start mt-[1rem]"},
			t({style: () => "mr-[.3rem]"}, () => "Don't have an account?"),
			b({click: () => nav("/signup"), style: () => "mb-[1rem] hover:underline"}, () => "Sign up"),
		),
	)
}

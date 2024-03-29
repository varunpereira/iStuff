import {
	state,
	react,
	write,
	d,
	clean,
	t,
	b,
	i,
	v,
	view,
	route,
	req,
	globe,
	path_encode,
} from "~/fe/config/shop"
import {cart_icon, search_icon, close_icon, mic_icon} from "~/fe/config/asset/icon"

export default () => {
	var nav = route()
	var form_error = state()
	var form_data = state({search: ""})
	var suggest = state([])
	var suggest_pick = state(null)
	var suggest_on = state(false)
	var mic_on = state(false)
	var themes = ["all", "tech"]
	var theme = themes[0]
	var page = "1"

	var click_outside = (el, accessor = () => "") => {
		var on_click = (e) => !el.contains(e.target) && accessor()
		view.put_listen("click", on_click)
		clean(() => view.cut_listen("click", on_click))
	}

	var form_submit = async (term) => {
		suggest_on(false)
		term.trim() !== "" ? nav("/search/all/" + path_encode(term) + "/1") : ""
	}

	var get_suggest = async () => {
		suggest([]) // loading
		var res = await req("/search/suggest", {search: form_data().search, theme, page})
		suggest(res.prod)
		suggest_on(true)
	}

	var key = (e) => {
		if (e.key === "Enter") form_submit(form_data().search)
		else if (e.key === "Escape") form_data({...form_data(), search: ""})
		else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			var put_pick
			if (e.key === "ArrowDown") {
				put_pick = suggest_pick() === null ? 0 : (suggest_pick() + 1) % suggest().length
			} else if (e.key === "ArrowUp") {
				put_pick =
					suggest_pick() === null
						? suggest().length - 1
						: (suggest_pick() - 1 + suggest().length) % suggest().length
			}
			form_data({...form_data(), search: suggest()[put_pick].title})
			suggest_pick(put_pick)
		}
	}

	var put_mic = () => {
		if (window.hasOwnProperty("webkitSpeechRecognition")) {
			var recognition = new webkitSpeechRecognition()
			recognition.continuous = false
			recognition.interimResults = false
			recognition.lang = "en-US"
			mic_on(true)
			recognition.start()
			recognition.onresult = (e) => {
				form_data({...form_data(), search: e.results[0][0].transcript})
				recognition.stop()
				mic_on(false)
				nav("/search/all/" + path_encode(form_data().search) + "/1")
				suggest_on(false)
			}
			recognition.onerror = (e) => {
				recognition.stop()
				mic_on(false)
			}
		}
	}

	return d(
		{style: () => "c_black tc_white w_full h-[2rem] r_full z_fit mr-[1rem]"},
		i({
			click: async () => {
				await get_suggest()
			},
			type: () => "text",
			value: () => form_data().search,
			input: async (e) => {
				form_data({...form_data(), search: e.target.value})
				await get_suggest()
			},
			key,
			holder: () => "search...",
			style: () => "c_black r_full px-[.8rem] v2:w-[70%] v3:w_full h_full o_null",
		}),
		() =>
			form_data().search.trim() !== "" &&
			d(
				{},
				b(
					{click: () => form_data({...form_data(), search: ""})},
					close_icon({
						style: () =>
							"z_put c_black z-[4] ibc_white hover:ibc_grey right-[3.75rem] top-[.6rem] w-[.8rem] h-[.8rem]",
					}),
				),
				() =>
					suggest_on() === true && suggest().length >= 1
						? d(
								{
									custom: (e) => click_outside(e, () => suggest_on(false)),
									style: () => "z_put z-[2] a_col c_black top-[2.5rem] w_full r_1 p-[1rem]",
								},
								() =>
									suggest().map((v, k) =>
										b(
											{
												click: () => {
													form_data({...form_data(), search: v.title})
													form_submit(v.title)
												},
												style: () =>
													"a_row hover:bg-gray-900 " + (suggest_pick() === k && "bg-gray-800"),
											},
											() => v.title,
										),
									),
						  )
						: suggest_on() === true && suggest().length === 0
						? d(
								{style: () => "z_put z-[2] bottom-[2.5rem] w_full r_1 p-[1rem]"},
								() => "Loading...",
						  )
						: "",
			),
		b(
			{click: put_mic},
			mic_icon({
				style: () =>
					"z_put z-[4] ic_white hover:ic_grey right-[2.25rem] top-[.5rem] w-[1rem] h-[1rem]",
			}),
		),
		b(
			{click: () => form_submit(form_data().search)},
			search_icon({
				style: () =>
					"z_put z-[4] ic_white hover:ic_grey right-[.5rem] top-[.3rem] w-[1.3rem] h-[1.3rem]",
			}),
		),
	)
}

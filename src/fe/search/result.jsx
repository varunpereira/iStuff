import {
	state,
	mount,
	react,
	write,
	d,
	t,
	b,
	i,
	v,
	route,
	globe,
	title,
	req,
	path,
} from "~/fe/config/shop"
import prod_short from "~/fe/prod/short"
import {auth} from "~/fe/config/auth"
import pager from "~/fe/generic/piece/pager"

export default () => {
	var nav = route()
	var path_par = path.par()
	var prod = state([])
	var pages = state()

	mount(async () => {
		await auth("pub")
	})

	react(async () => {
		var res = await req("/search/result", {
			search: path_par.term,
			theme: path_par.theme,
			page: path_par.page,
		})
		prod(res.prod)
		write(res)
		pages(res.pages)
	})

	return d(
		{style: () => "fit_1"},
		title({}, () => "Search Results - iStuff"),
		d({style:()=>"mb-[1rem]"}, () =>
			prod().length === 0
				? t({}, () => "No results for " + path_par.term)
				: () =>
						d(
							{style: () => "a_row_auto gap-[1rem]"},
							prod().map((v, k) => prod_short({prod: v})),
						),
		),
		pager({cur: ()=>path_par.page, size: () => pages(), link:()=>'/search?term=&theme=all'}),
	)
}

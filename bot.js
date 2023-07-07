import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const bot = new Telegraf(process.env.BOT_API_TOKEN);
let TOKEN;

bot.start((ctx) =>
	ctx.reply(
		`Hello ${
			ctx.message.from.first_name ? ctx.message.from.first_name : "Stranger"
		}!`
	)
);

bot.help((ctx) => ctx.reply(my_const.commands));

bot.command("cars", async (ctx) => {
	try {
		await ctx.replyWithHTML(
			"Would you like to fetch the cars or set the TOKEN?",
			Markup.inlineKeyboard([
				[
					Markup.button.callback("Fetch", "btn_1"),
					Markup.button.callback("Set Token", "btn_2"),
				],
			])
		);
	} catch (e) {
		console.error(e);
	}
});

bot.action("btn_1", async (ctx) => {
	try {
		const response = await axios.get(
			"https://www.olx.uz/api/v1/offers?category_id=983"
		);

		console.log(response.data.data.length);

		for (let i = 40; i < response.data.data.length; i++) {
			const element = response.data.data[i];

			if (element.promotion.options.length === 0) {
				const mediaFiles = [];

				element.photos.forEach((el) => {
					mediaFiles.push({
						type: "photo",
						media: el.link.split(";")[0],
						parse_mode: "HTML",
					});
				});

				let model =
					element.params[0].name + ":" + "#" + element.params[0].value.label;
				let price =
					element.params[1].name + ":" + "$" + element.params[1].value?.value;
				let year =
					element.params[3].name + ":" + element.params[3].value?.label;
				let mileage =
					element.params[4].name + ":" + element.params[4].value?.label;
				let type =
					element.params[5].name + ":" + "#" + element.params[5].value?.label;
				let color =
					element.params[6].name + ":" + element.params[6].value?.label;
				let fuel =
					element.params[8].name + ":" + element.params[8].value?.label;

				let location =
					"#" + element.location.city.name || element.location.region.name;

				let link = element.url;

				// const config = {
				// 	headers: {
				// 		Authorization: `Bearer ${TOKEN}`,
				// 	},
				// };

				// console.log(config);

				// const phoneNumber = await axios.get(
				// 	`https://www.olx.uz/api/v1/offers/${element.id}/limited-phones/`,
				// 	config
				// );

				// console.log(phoneNumber);

				let caption = `\u{1F6A8}${
					element.title
				}\n\n${element.description.replace(
					/<br\s*\/?>/gm,
					""
				)} \n\n\u{2705}${model}\n\u{1F4B2}${price}\n\u{1F4C5}${year}\n\u{1F4DF}${mileage}\n\u{1F697}${type}\n\u{1F534}${color}\n\u{26FD}${fuel}\n\u{1F6A9}${location}`;

				mediaFiles[0]["caption"] = caption;

				console.log(caption.length);
				if (caption.length < 500) {
					// Send the media group with HTML text
					await ctx.replyWithMediaGroup(mediaFiles);
					await ctx.sendMessage(link);
				}
			}
		}

		await ctx.answerCbQuery();
	} catch (e) {
		console.error(e);
	}
});
bot.action("btn_2", async (ctx) => {
	try {
		const chatId = ctx.chat.id;
		await ctx.reply("Please send me the token");

		// Listen for the next text message from the user
		bot.on("text", (ctx) => {
			const token = ctx.message.text;
			TOKEN = token;
			ctx.reply("Token received successfully!");
		});
		await ctx.answerCbQuery();
	} catch (e) {
		console.error(e);
	}
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

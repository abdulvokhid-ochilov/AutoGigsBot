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

		for (let i = 45; i < response.data.data.length; i++) {
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
					element.params[0].name + ":" + element.params[0].value.label;
				let price =
					element.params[1].name + ":" + "$" + element.params[1].value?.value;
				let year =
					element.params[3].name + ":" + element.params[3].value?.label;
				let mileage =
					element.params[4].name + ":" + element.params[4].value?.label;
				let type =
					element.params[5].name + ":" + element.params[5].value?.label;
				let color =
					element.params[6].name + ":" + element.params[6].value?.label;
				let fuel =
					element.params[8].name + ":" + element.params[8].value?.label;

				let location =
					element.location.city.name || element.location.region.name;

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

				let caption = `${element.title}\n${element.description.replace(
					/<br\s*\/?>/gm,
					""
				)} \n${model}\n${price}\n${year}\n${mileage}\n${type}\n${color}\n${fuel}\n${location}`;

				mediaFiles[0]["caption"] = caption;

				// Send the media group with HTML text
				await ctx.replyWithMediaGroup(mediaFiles);
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

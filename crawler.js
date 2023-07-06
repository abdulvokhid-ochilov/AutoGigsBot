import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getRandom } from "random-useragent";

export class Crawler {
	constructor() {
		this.browser = null;
		this.page = null;
		this.cars = [];
	}

	async initialize() {
		puppeteer.use(StealthPlugin());

		this.browser = await puppeteer.launch({
			headless: false,
		});
		this.page = await this.browser.newPage();

		await this.page.setViewport({
			width: 1920 + Math.floor(Math.random() * 100),
			height: 3000 + Math.floor(Math.random() * 100),
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: false,
			isMobile: false,
		});
		const userAgent = getRandom();
		const UA = userAgent;

		await this.page.setUserAgent(UA);
		await this.page.setJavaScriptEnabled(true);

		//Skip images/styles/fonts loading for performance
		await this.page.setRequestInterception(true);
		this.page.on("request", (req) => {
			if (
				req.resourceType() == "stylesheet" ||
				req.resourceType() == "font" ||
				req.resourceType() == "image"
			) {
				req.abort();
			} else {
				req.continue();
			}
		});

		// Increase the navigation timeout to 60 seconds (60000 milliseconds)
		await this.page.setDefaultNavigationTimeout(100000);
	}

	async crawl(url) {
		await this.page.goto(url);

		const data = await this.page.evaluate(() => {
			const elements = document.querySelectorAll('div[data-cy="l-card"]');
			const results = [];

			elements.forEach((element) => {
				const id = element.id;
				// const html = element.innerHTML;
				const link = element.querySelector("a").href;
				results.push({ id, link });
			});

			return results;
		});

		// this.page.close();
		return data;
	}

	async fetchPagesData(links) {
		for (let i = 45; i < links.length; i++) {
			const element = links[i];
			await this.page.goto(element.link);
			console.log(element.link);

			const linkHandlers = await this.page.$x(
				"//button[contains(text(), 'показать')]"
			);

			if (linkHandlers.length > 0) {
				await linkHandlers[0].click();
			} else {
				throw new Error("Button not found");
			}

			const data = await this.page.evaluate(() => {
				const elements = document.querySelectorAll("div.swiper-zoom-container");
				const images = [];
				const tagsName = [];

				elements.forEach((element) => {
					const link = element.querySelector("img").src;
					images.push(link);
				});

				const name = document.querySelector(
					'h1[data-cy="ad_title"]'
				).textContent;

				const price = document.querySelector(
					'div[data-testid="ad-price-container"]'
				).firstChild.textContent;

				const tags = document.querySelectorAll("li[class='css-1r0si1e']");

				tags.forEach((element) => {
					const tag = element.querySelector("p").textContent;
					tagsName.push(tag);
				});

				const description = document.querySelector(
					'div[data-cy="ad_description"]'
				).lastChild.textContent;

				const number = document.querySelector(
					'a[data-testid="contact-phone"]'
				)?.textContent;

				return {
					name,
					price,
					tagsName,
					description,
					number,
					images,
				};
			});
			this.cars.push(data);
		}
	}

	async close() {
		await this.browser.close();
	}
}

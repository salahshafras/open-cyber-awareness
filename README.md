# Open Cyber Awareness Simulator

An open-source, interactive web-based training platform designed to help organizations, educators, and everyday users recognize social engineering attacks—including **phishing emails**, **SMS phishing (smishing)**, and **voice phishing (vishing)** scenarios.

## Features
* **Multi-Channel Scenarios:** Interactive walkthroughs covering realistic email (`email-1` to `email-5`), SMS (`sms-1` to `sms-3`), and vishing attack vectors.
* **Data-Driven Architecture:** Modular JSON scenario definitions (`/data`) allowing educators and security teams to easily add localized or custom threat simulations.
* **Zero-Backend Deployment:** Built with lightweight HTML, CSS, and vanilla JavaScript so schools, nonprofits, and small teams can host awareness training for free.

## Project Structure
* `/data` — Structured JSON configurations for social engineering scenarios.
* `/js` & `/css` — Interactive evaluation logic and responsive UI components.
* `scenarios.html` — Central hub for launching phishing, smishing, and vishing exercises.

## Roadmap
- [x] Core email, SMS, and vishing interactive modules
- [ ] Multilingual scenario packs and localized threat templates
- [ ] Exportable completion certificates and awareness scoring analytics
- [ ] AI-assisted scenario generator for emerging social engineering tactics

## License
Open-source for educational and community cybersecurity awareness.

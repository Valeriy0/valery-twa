import styles from "./About.module.scss";
import Marquee from "react-fast-marquee";
import { Book, Community, HomePage, Info, Instruction, PartnersImg, Rocket, Token, Wallet, Group, BookImg, Telegram, Message, Youtube, Twitter, BookActive } from '../../assets';
import { Link, Route, BrowserRouter, Routes } from "react-router-dom";
import classNames from "classNames"


function About() {

	function CopyFunc() {
		let text = (document.getElementById("Pdf")  as HTMLInputElement).textContent;
		navigator.clipboard.writeText(text ? text : "");
	}

	return (
		<>	
			<Marquee className={styles.Ticker}>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
				<p className={styles.Ticker_Text}>1 tko = 18,78$</p>
			</Marquee>
			<div className={styles.CenterInfo}>
				<div className={styles.CenterImg}>
					<img src={BookImg} alt="" className={styles.MainImg} />
				</div>
				<h1 className={styles.AboutText}>About project</h1>
				<div className={styles.AboutButtons}>
					<img src={Telegram} alt="" className={styles.cursor_pointer} />
					<img src={Message} alt="" className={styles.cursor_pointer} />
					<img src={Youtube} alt="" className={styles.cursor_pointer} />
					<img src={Twitter} alt="" className={styles.cursor_pointer} />
				</div>
				<div className={styles.MainPdf}>
					<h1 className={styles.MainPdf_Text}>Main PDF</h1>
					<h1 id='Pdf' className={styles.MainPdf_Title}>tokenBot.io/pdf</h1>
					<div onClick={CopyFunc} className={classNames(styles.cursor_pointer, styles.MainPdf_Button)}>Copy</div>
				</div>
			</div>
			<div className={styles.Footer}>
				<Link to="/partners" className={styles.FooterButton}><img src={Community} alt="" /></Link>
				<Link to="/" className={styles.FooterButton}><img src={HomePage} alt="" /></Link>
				<Link to="/about" className={styles.FooterButton}><div className={styles.FooterButtonActive}><img src={BookActive} alt="" /></div></Link>
			</div>
		</>
	);
  }

export default About;

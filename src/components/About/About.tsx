import styles from "./About.module.scss";
import Marquee from "react-fast-marquee";
import { Book, Community, HomePage, Info, Instruction, PartnersImg, Rocket, Token, Wallet, Group, BookImg, Telegram, Message, Youtube, Twitter, BookActive, Exit } from '../../assets';
import { Link, Route, BrowserRouter, Routes } from "react-router-dom";
import classNames from "classNames"
import { useState } from 'react'
import Links from '../../store/links/links';
import { useTonConnectUI } from '@tonconnect/ui-react'
import { MessageLink, TelegramLink, TwitterLink, YouTubeLink } from '../../constants'


function About() {
	const [tonConnectUI, setOptions] = useTonConnectUI();
	const [CopyText, setCopyText] = useState(false);

	function CopyFunc() {
		let text = (document.getElementById("Pdf")  as HTMLInputElement).textContent;
		navigator.clipboard.writeText(text ? text : "");
		setCopyText(true);
		setTimeout(() => (document.getElementById("BlockCopyAbout") as HTMLDivElement).setAttribute('style', `transition: transform 0.7s; transform: translateX(-102px);`), 300);
		setTimeout(() => (document.getElementById("BlockCopyAbout") as HTMLDivElement).setAttribute('style', `transition: transform 0.7s; transform: translateX(102px);`), 1700);
		setTimeout(() => setCopyText(false), 2500);
	}

	return (
		<div id='About' className='hidden'>	
			<img src={Exit} alt="" className={styles.Exit} onClick={() => tonConnectUI.disconnect()} />
			<div className={styles.CenterInfo}>
				<div className={styles.CenterImg}>
					<img src={BookImg} alt="" className={styles.MainImg} />
				</div>
				<h1 className={styles.AboutText}>About project</h1>
				<div className={styles.AboutButtons}>
					<a href={TelegramLink}>	<img src={Telegram} alt="" className={styles.cursor_pointer} /> </a>
					<a href={MessageLink}> <img src={Message} alt="" className={styles.cursor_pointer} /> </a>
					<a href={YouTubeLink}> <img src={Youtube} alt="" className={styles.cursor_pointer} /> </a>
					<a href={TwitterLink}> <img src={Twitter} alt="" className={styles.cursor_pointer} /> </a>
				</div>
				<div className={styles.MainPdf}>
					<h1 className={styles.MainPdf_Text}>Main PDF</h1>
					<h1 id='Pdf' className={styles.MainPdf_Title}>tokenBot.io/pdf</h1>
					<div onClick={CopyFunc} className={classNames(styles.cursor_pointer, styles.MainPdf_Button)}>Copy</div>
				</div>
			</div>
			<div className={styles.Footer}>
				<div onClick={Links.GoPartners} className={styles.FooterButton}><img src={Community} alt="" /></div>
				<div onClick={Links.GoMain} className={styles.FooterButton}><img src={HomePage} alt="" /></div>
				<div onClick={Links.GoAbout} className={styles.FooterButton}><div className={styles.FooterButtonActive}><img src={BookActive} alt="" /></div></div>
			</div>
			{CopyText ? <h1 id="BlockCopyAbout" className={styles.BlockCopy}><p className={styles.BlockCopyText}>Copied</p></h1> : ""}
		</div>
	);
  }

export default About;

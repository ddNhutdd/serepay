import React, { useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import Footer from "../Footer";
import { url } from "src/constant";
import { useSelector } from "react-redux";
import PhoneApps from "../PhoneApps";
function Home() {
  const history = useHistory();
  useEffect(() => {
    const animationHeader = function () {
      var header = document.querySelector(".home__header");
      if (header) {
        var scrollPosition = window.scrollY;
        if (scrollPosition >= 50) {
          header.classList.add("scroll");
        } else {
          header.classList.remove("scroll");
        }
      }
    };
    const closeMenu = function () {
      const bars = document.querySelectorAll(
        ".home__header .home__header__bar-item"
      );
      if (bars) {
        for (let item of bars) {
          item.classList.remove("active");
        }
      }
      const menu = document.querySelector(".home__header .home__header__menu");
      if (menu) {
        menu.classList.remove("--d-flex");
      }
      const loginContainer = document.querySelector(
        ".home__header .home__header__login-container"
      );
      if (loginContainer) {
        loginContainer.classList.remove("--d-block");
      }
    };
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", animationHeader);
    return () => {
      window.removeEventListener("scroll", animationHeader);
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  const isLogin = useSelector((state) => state.loginReducer.isLogin);
  const redirectToLogin = function (e) {
    e.preventDefault();
    history.push(url.login);
  };
  const redirectToPage = function (e) {
    const page = e.currentTarget.dataset.page;
    history.push(page);
  };
  const tabOnClickHandle = function (e) {
    const order = e.target.dataset.name;
    const tabs = document.querySelectorAll(
      ".home__faqs  .home__faqs-list-tab li"
    );
    if (tabs) {
      for (const item of tabs) {
        if (item.dataset.name === order) {
          item.classList.add("active");
        } else if (item.dataset.name !== order) {
          item.classList.remove("active");
        }
      }
    }
    const tabsContent = document.querySelectorAll(
      ".home__faqs  .home__faqs-tab-content"
    );
    if (tabsContent) {
      for (const item of tabsContent) {
        if (item.dataset.name === order) {
          item.classList.remove("--d-none");
          item.classList.add("fadeIn");
        } else if (item.dataset.name !== order) {
          item.classList.remove("fadeIn");
          item.classList.add("--d-none");
        }
      }
    }
  };
  const headerBarButtonClickHandle = function (e) {
    if (e) e.stopPropagation();
    const bars = document.querySelectorAll(
      ".home__header .home__header__bar-item"
    );
    if (bars) for (let item of bars) item.classList.toggle("active");
    const menu = document.querySelector(".home__header .home__header__menu");
    if (menu) menu.classList.toggle("--d-flex");
    const loginContainer = document.querySelector(
      ".home__header .home__header__login-container"
    );
    if (loginContainer) loginContainer.classList.toggle("--d-block");
  };
  const scrollToContent = function (id) {
    const ele = document.getElementById(id);
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home">
      <div className="main-template__bg-1"></div>
      <div className="main-template__bg-2"></div>
      <div className="main-template__bg-3"></div>
      <div className="home__header">
        <div className="container">
          <NavLink to="" className="home__header__icon">
            <img
              src={process.env.PUBLIC_URL + "/img/logowhite.png"}
              alt="logo"
            />
          </NavLink>
          <ul className="home__header__menu fadeIn">
            <li>
              <div
                data-page={url.p2pTrading}
                className="home__header__menu-item"
                onClick={redirectToPage}
              >
                EXCHANGE
              </div>
            </li>
            <li>
              <div
                data-page={url.wallet}
                className="home__header__menu-item"
                onClick={redirectToPage}
              >
                WALLET
              </div>
            </li>
            <li>
              <div
                className="home__header__menu-item"
                name=""
                onClick={scrollToContent.bind(null, "home__benefit")}
              >
                COIN
              </div>
            </li>
            <li>
              <div
                className="home__header__menu-item"
                onClick={scrollToContent.bind(null, "home__apps")}
              >
                APP
              </div>
            </li>
            <li>
              <div
                className="home__header__menu-item"
                onClick={scrollToContent.bind(null, "home__faqs")}
              >
                FAQ
              </div>
            </li>
          </ul>
          {!isLogin ? (
            <div className="home__header__login-container  fadeIn">
              <button onClick={redirectToLogin} className="home__header__login">
                Login
              </button>
            </div>
          ) : (
            <></>
          )}
          <div
            onClick={headerBarButtonClickHandle}
            className="home__header__bar"
          >
            <div className="home__header__bar-item"></div>
            <div className="home__header__bar-item"></div>
            <div className="home__header__bar-item"></div>
          </div>
        </div>
      </div>
      <div className="home__carousel">
        <div className="container">
          <div className="home__carousel__content">
            <div className="home__carousel__left">
              <h1 className="home__carousel__title">
                Cryptocurrency Wallet - Buy/Sell Bitcoin, Ethereum and Altcoins
              </h1>
              <p className="home__carousel__text">
                Serepay is a multi-industry eco-system that helps to deepen the
                application of cryptocurrencies to each business and as an
                alternative to traditional exchanges.
              </p>
              {!isLogin ? (
                <button
                  onClick={redirectToLogin}
                  className="home__carousel__button"
                >
                  SIGN UP NOW
                </button>
              ) : (
                <></>
              )}
            </div>
            <div className="home__carousel__right">
              <img
                src={process.env.PUBLIC_URL + "/img/hinhhometobe.png"}
                alt="carousel"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="home__why">
        <div className="home__why__video-container">
          <video
            id="myVideo"
            width="100%"
            height="100%"
            loop
            muted
            playsInline
            autoPlay
          >
            <source
              src={process.env.PUBLIC_URL + "/videos/video.mkv"}
              type="video/mp4"
            />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
          <div className="home__why__video-overlay"></div>
        </div>
        <div className="home__why__content">
          <h3>Why to choose Serepay?</h3>
          <p>
            Serepay is a pioneer multifunctional wallet in the field of
            Blockchain and digital asset storage!
          </p>
          <small>
            Users can send, receive, and exchange their electronic money
            conveniently and easily. Serepay meets all the needs of the
            community of token users as well as other cryptocurrencies.
          </small>
        </div>
      </div>
      <div id="home__benefit" className="home__benefit">
        <div className="container">
          <div className="home__benefit__background"></div>
          <div className="home__benefit__wrap-content">
            <div className="home__benefit__left">
              <div className="home__benefit__left-column-left">
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-1.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">Safe and Secure</h3>
                  <p className="home__benefit__text">
                    Advanced security features, such as 2-step verification.
                  </p>
                </div>
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-3.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">Instant Exchange</h3>
                  <p className="home__benefit__text">
                    Advanced security features, such as 2-step verification.
                  </p>
                </div>
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-5.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">Strong Network</h3>
                  <p className="home__benefit__text">
                    Serepay is designed to resist the change of data once the
                    data is accepted by the network, there is no way to change
                    it.
                  </p>
                </div>
              </div>
              <div className="home__benefit__left-column-right">
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-2.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">Mobile Apps</h3>
                  <p className="home__benefit__text">
                    Serepay is compatible with iOS, Android, and Website
                    operating systems.
                  </p>
                </div>
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-4.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">World Coverage</h3>
                  <p className="home__benefit__text">
                    The World Economic Forum’ predicts that 10% of global GDP
                    will be stored on Blockchain by 2025.
                  </p>
                </div>
                <div className="home__benefit__card">
                  <img
                    src={process.env.PUBLIC_URL + "/img/home-6.png"}
                    alt="defend"
                  />
                  <h3 className="home__benefit__title">Margin Trading</h3>
                  <p className="home__benefit__text">
                    The option to use x2 leverage can be used on all
                    cryptocurrency transactions.
                  </p>
                </div>
              </div>
            </div>
            <div className="home__benefit__right">
              <div className="home__benefit__content">
                <h3>Benefits of Using Our Solution</h3>
                <p>
                  Advanced security features, intuitive user interface and easy
                  navigation. Easy to pair web wallet with mobile device by
                  scanning QR code. Buy and sell directly through Serepay your.
                </p>
              </div>
              <img
                src={process.env.PUBLIC_URL + "/img/home-7.png"}
                alt="home"
              />
            </div>
          </div>
        </div>
      </div>
      <div id="home__apps">
        <PhoneApps />
      </div>
      <div id="home__faqs" className="home__faqs">
        <div className="container">
          <div className="home__faqs-content">
            <span>FAQS</span>
            <h3>Frequently Asked questions</h3>
            <div className="home__faqs-tabs">
              <ul className="home__faqs-list-tab">
                <li className="active" data-name={1} onClick={tabOnClickHandle}>
                  GENERAL
                </li>
                <li data-name={2} onClick={tabOnClickHandle}>
                  KYC & MINING
                </li>
                <li data-name={3} onClick={tabOnClickHandle}>
                  BLOCKCHAIN
                </li>
                <li data-name={4} onClick={tabOnClickHandle}>
                  OTHERS
                </li>
              </ul>
              <div className="home__faqs-tab-content --d-none" data-name={1}>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
              </div>
              <div className="home__faqs-tab-content --d-none" data-name={2}>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">
                    Is Serepay App available on Android and IOS?
                  </div>
                  <div className="home__faqs-card-content">
                    1.Register with an Cryptocurrency Exchange. To participate
                    in an ICO you need cryptocurrencies, usually Ether.... You
                    can install Serepay application on both Appstore and Google
                    Play. For Google Play store: You just need to input
                    “Serepay” at search box and install. For Appstore store: You
                    have to input “TestFlight” at search box and install. Then,
                    open TestFlight and you will see Serepay application in
                    there.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">
                    What documents do users need for KYC level 1 on Serepay?
                  </div>
                  <div className="home__faqs-card-content">
                    In order to use Serepay app, users need to verify the
                    account step 1 with personal information, pictures of
                    government-issued ID card (2 sides), and a full face photo.
                  </div>
                </div>
              </div>
              <div className="home__faqs-tab-content --d-none" data-name={3}>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">
                    What is a Blockchain Explorer?
                  </div>
                  <div className="home__faqs-card-content">
                    A blockchain explorer is a web application for blockchains,
                    that allows users to know details of activities happening on
                    that particular blockchain, including the transaction
                    status. Just like it is with internet explorers, it enables
                    users to browse specific blockchains. This means that you
                    can only use a bitcoin block explorer to browse bitcoin
                    transactions. You cannot use it to browse Ethereum or
                    Litecoin transactions.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
              </div>
              <div className="home__faqs-tab-content" data-name={4}>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">
                    What is Ethereum (ETH)?
                  </div>
                  <div className="home__faqs-card-content">
                    <p>
                      Ethereum is an open-source, public, blockchain-based
                      distributed computing platform featuring smart contract
                      (scripting) functionality (enables developers to build and
                      deploy decentralized applications.) (…) It is listed under
                      the code ETH and traded on cryptocurrency exchanges. It is
                      also used to pay for transaction fees and computational
                      services on the Ethereum network.” – Wikipedia
                    </p>
                    <p>
                      What is the difference between ETH and BTC? On Remitano,
                      both are crypto-currencies that can be traded at the same
                      way. Thus there is no difference from that perspective. On
                      a technical level, ETH and BTC have a few different
                      points. Ethereum managed to fix disadvantages from Bitcoin
                      such as high transaction fee and slow block confirmation.
                      Bitcoin’s average block time is about 10 minutes, while
                      Ethereum’s aims to be 12 seconds.
                    </p>
                  </div>
                </div>
                <div className="home__faqs-card">
                  <div className="home__faqs-card-header">What is Serepay?</div>
                  <div className="home__faqs-card-content">
                    Serepay is a Decentralized Coin Wallet which combines P2P
                    trading platform to help the startup community reach out to
                    investors from the Serepay community in more than 40
                    countries. The users community can both store coins and
                    trade coins into fiat currency with the lowest fees. Serepay
                    is one of 12 ecosystems of Tobe Chain.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="home__faqs-background"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Home;

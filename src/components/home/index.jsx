import React, { useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import Footer from "../Footer";
import { url } from "src/constant";
import { useSelector } from "react-redux";
import PhoneApps from "../PhoneApps";
import { createIntersectionObserve } from "src/util/common";
function Home() {
  const history = useHistory();
  const isLogin = useSelector((state) => state.loginReducer.isLogin);

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

    const homeCarouselTitle = document.querySelector("#homeCarouselTitle");
    const homeCarouselTitleObserve = createIntersectionObserve(
      homeCarouselTitleObserverHandle,
      homeCarouselTitle
    );

    const homeCarouselText = document.querySelector("#homeCarouselText");
    const homeCarouselTextObserve = createIntersectionObserve(
      homeCarouselTextObserverHandle,
      homeCarouselText
    );

    const homeCarouselImage = document.querySelector("#homeCarouselImage");
    const homeCarouselImageObserve = createIntersectionObserve(
      homeCarouselTextObserverHandle,
      homeCarouselImage
    );

    const homeWhyTitle = document.querySelector("#homeWhyTitle");
    const homeWhyTitleObserve = createIntersectionObserve(
      homeWhyTitleObserverHandle,
      homeWhyTitle
    );

    const homeWhyPara = document.querySelector("#homeWhyPara");
    const homeWhyParaObserve = createIntersectionObserve(
      homeWhyParaObServerHandle,
      homeWhyPara
    );

    const homeWhySmall = document.querySelector("#homeWhySmall");
    const homeWhySmallObserve = createIntersectionObserve(
      homeWhyParaObServerHandle,
      homeWhySmall
    );

    const homeBenefitLeft = document.querySelector("#homeBenefitLeft");
    const homeBenefitLeftObserve = createIntersectionObserve(
      homeBenefitLeftObServerHandle,
      homeBenefitLeft
    );

    const homeBenefitRight = document.querySelector("#homeBenefitRight");
    const homeBenefitRightObserve = createIntersectionObserve(
      homeBenefitRightObServerHandle,
      homeBenefitRight
    );

    return () => {
      window.removeEventListener("scroll", animationHeader);
      window.removeEventListener("click", closeMenu);
      homeCarouselTitleObserve.disconnect();
      homeCarouselTextObserve.disconnect();
      homeCarouselImageObserve.disconnect();
      homeWhyTitleObserve.disconnect();
      homeWhyParaObserve.disconnect();
      homeWhySmallObserve.disconnect();
      homeBenefitLeftObserve.disconnect();
      homeBenefitRightObserve.disconnect();
    };
  }, []);

  const homeCarouselTitleObserverHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("backInUp") &&
          element.classList.add("backInUp");
    }
  };
  const homeCarouselTextObserverHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("fadeIn-long") &&
          element.classList.add("fadeIn-long");
    }
  };
  const homeWhyTitleObserverHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("wobble") &&
          element.classList.add("wobble");
    }
  };
  const homeWhyParaObServerHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("fadeInBottomToTop-long") &&
          element.classList.add("fadeInBottomToTop-long");
    }
  };
  const homeBenefitLeftObServerHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("backInLeft") &&
          element.classList.add("backInLeft");
    }
  };
  const homeBenefitRightObServerHandle = function (entries) {
    for (const entry of entries) {
      const element = entry.target;
      if (!entry.isIntersecting) return;
      else
        !element.classList.contains("backInRight") &&
          element.classList.add("backInRight");
    }
  };
  const redirectToLogin = function (e) {
    e.preventDefault();
    history.push(url.login);
  };
  const redirectToPage = function (e) {
    const page = e.currentTarget.dataset.page;
    history.push(page);
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
            {!isLogin && (
              <li>
                <div className="home__header__login-container  fadeIn">
                  <button
                    onClick={redirectToLogin}
                    className="home__header__login"
                  >
                    Login
                  </button>
                </div>
              </li>
            )}
          </ul>
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
              <h1 id="homeCarouselTitle" className="home__carousel__title">
                Cryptocurrency Wallet - Buy/Sell Bitcoin, Ethereum and Altcoins
              </h1>
              <p id="homeCarouselText" className="home__carousel__text">
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
            <div id="homeCarouselImage" className="home__carousel__right">
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
          <h3 id="homeWhyTitle">Why to choose Serepay?</h3>
          <p id="homeWhyPara">
            Serepay is a pioneer multifunctional wallet in the field of
            Blockchain and digital asset storage!
          </p>
          <small id="homeWhySmall">
            Users can send, receive, and exchange their cryptocurrency
            conveniently and easily. Serepay meets all the needs of the
            community of token users as well as other cryptocurrencies.
          </small>
        </div>
      </div>
      <div id="home__benefit" className="home__benefit">
        <div className="container">
          <div className="home__benefit__background"></div>
          <div className="home__benefit__wrap-content">
            <div id="homeBenefitLeft" className="home__benefit__left">
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
            <div id="homeBenefitRight" className="home__benefit__right">
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
      <Footer />
    </div>
  );
}
export default Home;

"use client";

require("../polyfill");

import { useState, useEffect, useCallback } from "react";

import styles from "./home.module.scss";

import ChatBotIcon from "../icons/ai-chat-bot.png";
import LoadingIcon from "../icons/three-dots.svg";
import NextImage from "next/image";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { useWebsiteConfigStore, useAuthStore, BOT_HELLO } from "../store";

export function Loading(props: {
  noLogo?: boolean;
  logoLoading: boolean;
  logoUrl?: string;
}) {
  const logoLoading = props.logoLoading;
  const logoUrl = props.logoUrl;
  const noLogo = props.noLogo;
  console.log("Loading logoUrl", noLogo, logoUrl);
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && (
        <NextImage
          src={ChatBotIcon.src}
          width={30}
          height={30}
          alt="bot"
          className="user-avatar"
        />
      )}
      <LoadingIcon />
    </div>
  );
}

const Login = dynamic(async () => (await import("./login")).Login, {
  loading: () => <Loading noLogo logoLoading />,
});

const Register = dynamic(async () => (await import("./register")).Register, {
  loading: () => <Loading noLogo logoLoading />,
});

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo logoLoading />,
});

const Profile = dynamic(async () => (await import("./profile")).Profile, {
  loading: () => <Loading noLogo logoLoading />,
});

const Pricing = dynamic(async () => (await import("./pricing")).Pricing, {
  loading: () => <Loading noLogo logoLoading />,
});

const Pay = dynamic(async () => (await import("./pay")).Pay, {
  loading: () => <Loading noLogo logoLoading />,
});

const Balance = dynamic(async () => (await import("./balance")).Balance, {
  loading: () => <Loading noLogo logoLoading />,
});

const Order = dynamic(async () => (await import("./order")).Order, {
  loading: () => <Loading noLogo logoLoading />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo logoLoading />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo logoLoading />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo logoLoading />,
});

export interface NoticeConfig {
  show: boolean;
  splash: boolean;
  title: string;
  content: string;
}
export interface NoticeConfigData {
  noticeContent: NoticeConfig;
}

import { Response } from "../api/common";
export type NoticeConfigResponse = Response<NoticeConfigData>;

export function useSwitchTheme() {
  const config = useAppConfig();
  const useWebsiteConfig = useWebsiteConfigStore();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);

  useEffect(() => {
    document.title = useWebsiteConfig.title || "AI Chat";
  }, [useWebsiteConfig.title]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  linkEl.rel = "stylesheet";
  linkEl.href =
    "/google-fonts/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
  document.head.appendChild(linkEl);
};

interface LogoInfo {
  uuid: string;
  url?: string;
  mimeType: string;
}
export interface LogoInfoResponse {
  code: number;
  message: string;
  data: LogoInfo;
}

function setFavicon(url: string, mimeType: string) {
  const link = document.createElement("link");
  link.rel = "shortcut icon";
  link.type = "image/svg+xml";
  link.href = url;
  const head = document.querySelector("head");
  if (head == null) {
    console.error("head is null");
    return;
  }
  const existingLink = document.querySelector('head link[rel="shortcut icon"]');
  if (existingLink) {
    head.removeChild(existingLink);
  }
  head.appendChild(link);
}

function Screen(props: { logoLoading: boolean; logoUrl?: string }) {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  const { fetchWebsiteConfig } = useWebsiteConfigStore();
  useEffect(() => {
    fetchWebsiteConfig();
  }, [fetchWebsiteConfig]);

  const { botHello } = useWebsiteConfigStore();
  useEffect(() => {
    if (botHello) {
      // todo i18n
      BOT_HELLO.content = botHello;
    }
  }, [botHello]);

  const [noticeShow, setNoticeShow] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  useEffect(() => {
    fetch("/api/globalConfig/notice", {
      method: "get",
    })
      .then((res) => res.json())
      .then((res: NoticeConfigResponse) => {
        console.log("[GlobalConfig] got notice config from server", res);
        const notice = res.data.noticeContent;
        if (notice.show) {
          setNoticeTitle(notice.title);
          setNoticeContent(notice.content);
          if (notice.splash) {
            setNoticeShow(true);
          }
        }
      })
      .catch(() => {
        console.error("[GlobalConfig] failed to fetch config");
      })
      .finally(() => {
        // fetchState = 2;
      });
  }, []);

  const logoLoading = props.logoLoading;
  const logoUrl = props.logoUrl || "";
  useEffect(() => {
    setFavicon(logoUrl, "");
  }, [logoUrl]);

  return (
    <div
      className={
        styles.container +
        ` ${
          config.tightBorder && !isMobileScreen
            ? styles["tight-container"]
            : styles.container
        }`
      }
    >
      <SideBar
        className={isHome ? styles["sidebar-show"] : ""}
        noticeShow={noticeShow}
        noticeTitle={noticeTitle}
        noticeContent={noticeContent}
        setNoticeShow={setNoticeShow}
        logoLoading={logoLoading}
        logoUrl={logoUrl}
      />

      <div className={styles["window-content"]} id={SlotID.AppBody}>
        <Routes>
          <Route path={Path.Home} element={<Chat />} />
          <Route path={Path.NewChat} element={<NewChat />} />
          <Route path={Path.Masks} element={<MaskPage />} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
          <Route path={Path.Login} element={<Login />} />
          <Route path={Path.Register} element={<Register />} />
          <Route path={Path.Profile} element={<Profile />} />
          <Route path={Path.Pricing} element={<Pricing />} />
          <Route path={Path.Pay} element={<Pay />} />
          <Route path={Path.Balance} element={<Balance />} />
          <Route path={Path.Order} element={<Order />} />
        </Routes>
      </div>
    </div>
  );
}

export function Home() {
  useSwitchTheme();

  const authStore = useAuthStore();
  const [logoLoading, setLogoLoading] = useState(false);
  const { fetchWebsiteConfig, logoUrl } = useWebsiteConfigStore();
  useEffect(() => {
    fetchWebsiteConfig();
  }, [fetchWebsiteConfig]);

  // const [logoInfo, setLogoInfo] = useState({
  //   uuid: false,
  //   url: "",
  //   mimeType: "",
  // } as any as LogoInfo);
  // useEffect(() => {
  //   setLogoLoading(true);
  //   // console.log('fetching logo info')
  //   fetch("/api/file/logoInfo", {
  //     method: "get",
  //     headers: {
  //       Authorization: "Bearer " + authStore.token,
  //     },
  //   })
  //     .then(async (resp) => {
  //       const json = (await resp.json()) as LogoInfoResponse;
  //       // console.log('fetched logo info')
  //       // console.log("json", json);
  //       const info = json.data;
  //       if (info.uuid !== null) {
  //         info.url = "/api/file/" + info.uuid;
  //         setLogoInfo({
  //           uuid: info.uuid,
  //           url: info.url,
  //           mimeType: info.mimeType
  //         });
  //         setFavicon(info.url, info.mimeType);
  //         console.log('logo set new', info)
  //       }
  //     })
  //     .finally(() => {
  //       setLogoLoading(false);
  //     });
  // }, [authStore.token]);

  if (!useHasHydrated()) {
    return (
      <Loading noLogo={false} logoLoading={logoLoading} logoUrl={logoUrl} />
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen logoLoading={logoLoading} logoUrl={logoUrl} />
      </Router>
    </ErrorBoundary>
  );
}

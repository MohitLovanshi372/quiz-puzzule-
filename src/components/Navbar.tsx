import React, { useState } from "react";
import { Trophy, User, Zap, Volume2, VolumeX, LayoutGrid } from "lucide-react";
import { ActiveTab, UserProfile } from "../types";
import { soundFx } from "../utils/audio";
interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: UserProfile;
}
export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  profile,
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());
  const handleNav = (tab: ActiveTab) => {
    soundFx.playClick();
    onSelectTab(tab);
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="brand"
          id="nav-logo"
          onClick={() => handleNav("home")}
          aria-label="QuizVerse home"
        >
          <span className="brand-icon">
            <Zap size={23} fill="currentColor" />
          </span>
          <span>
            Quiz<span className="brand-accent">Verse</span>
            <span className="brand-period">.</span>
          </span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            { tab: "home" as ActiveTab, label: "Play arena", Icon: LayoutGrid },
            {
              tab: "leaderboard" as ActiveTab,
              label: "Leaderboard",
              Icon: Trophy,
            },
            { tab: "profile" as ActiveTab, label: "My profile", Icon: User },
          ].map(({ tab, label, Icon }) => {
            const active =
              tab === "home"
                ? ["home", "quiz", "results"].includes(activeTab)
                : activeTab === tab;
            return (
              <button
                type="button"
                id={`nav-tab-${tab}`}
                key={tab}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => handleNav(tab)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-utilities">
          <button
            type="button"
            id="btn-sound-toggle"
            className="sound-button"
            aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            aria-pressed={!isMuted}
            onClick={() => setIsMuted(soundFx.toggleMute())}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            className="player-button"
            id="nav-user-preview"
            onClick={() => handleNav("profile")}
            aria-label={`View profile, level ${profile.level}`}
          >
            <span className="player-avatar">{profile.avatar}</span>
            <span className="player-level">LVL {profile.level}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

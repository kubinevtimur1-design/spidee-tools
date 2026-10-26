"use client";

export default function HeroSlime() {
  return (
    <div className="slime-stage" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="blob blob-5" />
      <div className="blob blob-6" />
      <div className="blob blob-7" />
      <div className="blob blob-8" />

      <style jsx>{`
        .slime-stage {
          position: absolute;
          inset: -25%;
          overflow: hidden;
          pointer-events: none;
          background: #f7f5f2;
          isolation: isolate;
          filter: saturate(1.25) contrast(1.08);
        }

        .blob {
          position: absolute;
          width: 58%;
          height: 68%;
          border-radius: 50%;
          filter: blur(44px);
          mix-blend-mode: multiply;
          opacity: 0.9;
          will-change: transform, border-radius;
          transform-origin: center;
        }

        .blob-1 {
          left: -5%;
          top: -5%;
          background: #ff3830;
          animation:
            fly1 2.9s linear infinite,
            morph1 1.85s ease-in-out infinite alternate;
        }

        .blob-2 {
          right: -8%;
          top: 0;
          background: #ff806f;
          animation:
            fly2 3.55s linear infinite,
            morph2 2.05s ease-in-out infinite alternate;
        }

        .blob-3 {
          left: 10%;
          bottom: -15%;
          background: #ff7600;
          animation:
            fly3 3.15s linear infinite,
            morph3 1.7s ease-in-out infinite alternate;
        }

        .blob-4 {
          right: 8%;
          bottom: -10%;
          width: 50%;
          height: 62%;
          background: #8f0715;
          opacity: 0.76;
          animation:
            fly4 4s linear infinite,
            morph1 2.4s ease-in-out infinite alternate;
        }

        .blob-5 {
          left: 30%;
          top: 12%;
          width: 50%;
          height: 58%;
          background: #ffd0b5;
          opacity: 0.82;
          animation:
            fly5 2.65s linear infinite,
            morph2 1.95s ease-in-out infinite alternate;
        }

        .blob-6 {
          left: 38%;
          top: 25%;
          width: 42%;
          height: 52%;
          background: #560716;
          opacity: 0.68;
          animation:
            fly6 3.35s linear infinite,
            morph3 2.15s ease-in-out infinite alternate;
        }

        .blob-7 {
          right: 18%;
          top: -10%;
          width: 48%;
          height: 56%;
          background: #ff3d5a;
          opacity: 0.8;
          animation:
            fly7 3.8s linear infinite,
            morph1 1.8s ease-in-out infinite alternate;
        }

        .blob-8 {
          left: -8%;
          bottom: 2%;
          width: 46%;
          height: 60%;
          background: #a62806;
          opacity: 0.7;
          animation:
            fly8 2.95s linear infinite,
            morph2 2.25s ease-in-out infinite alternate;
        }

        @keyframes fly1 {
          0% {
            transform: translate3d(-20vw, -18vh, 0)
              scale(0.8) rotate(0deg);
          }
          20% {
            transform: translate3d(70vw, 5vh, 0)
              scale(1.55) rotate(100deg);
          }
          40% {
            transform: translate3d(85vw, 75vh, 0)
              scale(0.65) rotate(190deg);
          }
          60% {
            transform: translate3d(15vw, 85vh, 0)
              scale(1.6) rotate(280deg);
          }
          80% {
            transform: translate3d(-18vw, 35vh, 0)
              scale(0.72) rotate(350deg);
          }
          100% {
            transform: translate3d(-20vw, -18vh, 0)
              scale(0.8) rotate(440deg);
          }
        }

        @keyframes fly2 {
          0% {
            transform: translate3d(18vw, -18vh, 0)
              scale(1.45) rotate(0deg);
          }
          20% {
            transform: translate3d(-75vw, 10vh, 0)
              scale(0.68) rotate(-100deg);
          }
          40% {
            transform: translate3d(-90vw, 78vh, 0)
              scale(1.6) rotate(-190deg);
          }
          60% {
            transform: translate3d(-20vw, 88vh, 0)
              scale(0.65) rotate(-280deg);
          }
          80% {
            transform: translate3d(12vw, 28vh, 0)
              scale(1.5) rotate(-360deg);
          }
          100% {
            transform: translate3d(18vw, -18vh, 0)
              scale(1.45) rotate(-450deg);
          }
        }

        @keyframes fly3 {
          0% {
            transform: translate3d(-15vw, 25vh, 0)
              scale(0.7) rotate(0deg);
          }
          20% {
            transform: translate3d(45vw, -80vh, 0)
              scale(1.55) rotate(110deg);
          }
          40% {
            transform: translate3d(90vw, -30vh, 0)
              scale(0.62) rotate(200deg);
          }
          60% {
            transform: translate3d(65vw, 35vh, 0)
              scale(1.65) rotate(290deg);
          }
          80% {
            transform: translate3d(5vw, -25vh, 0)
              scale(0.68) rotate(370deg);
          }
          100% {
            transform: translate3d(-15vw, 25vh, 0)
              scale(0.7) rotate(460deg);
          }
        }

        @keyframes fly4 {
          0% {
            transform: translate3d(15vw, 25vh, 0)
              scale(0.72) rotate(0deg);
          }
          20% {
            transform: translate3d(-65vw, -70vh, 0)
              scale(1.7) rotate(-105deg);
          }
          40% {
            transform: translate3d(-95vw, -15vh, 0)
              scale(0.6) rotate(-200deg);
          }
          60% {
            transform: translate3d(-50vw, 55vh, 0)
              scale(1.6) rotate(-295deg);
          }
          80% {
            transform: translate3d(-5vw, -28vh, 0)
              scale(0.68) rotate(-380deg);
          }
          100% {
            transform: translate3d(15vw, 25vh, 0)
              scale(0.72) rotate(-470deg);
          }
        }

        @keyframes fly5 {
          0% {
            transform: translate3d(0, -20vh, 0)
              scale(1.5) rotate(0deg);
          }
          20% {
            transform: translate3d(-65vw, 60vh, 0)
              scale(0.65) rotate(110deg);
          }
          40% {
            transform: translate3d(15vw, 80vh, 0)
              scale(1.7) rotate(210deg);
          }
          60% {
            transform: translate3d(65vw, 30vh, 0)
              scale(0.62) rotate(300deg);
          }
          80% {
            transform: translate3d(40vw, -35vh, 0)
              scale(1.55) rotate(390deg);
          }
          100% {
            transform: translate3d(0, -20vh, 0)
              scale(1.5) rotate(480deg);
          }
        }

        @keyframes fly6 {
          0% {
            transform: translate3d(0, 0, 0)
              scale(0.6) rotate(0deg);
          }
          20% {
            transform: translate3d(65vw, -60vh, 0)
              scale(1.75) rotate(-110deg);
          }
          40% {
            transform: translate3d(55vw, 60vh, 0)
              scale(0.58) rotate(-205deg);
          }
          60% {
            transform: translate3d(-60vw, 70vh, 0)
              scale(1.8) rotate(-300deg);
          }
          80% {
            transform: translate3d(-65vw, -45vh, 0)
              scale(0.65) rotate(-390deg);
          }
          100% {
            transform: translate3d(0, 0, 0)
              scale(0.6) rotate(-480deg);
          }
        }

        @keyframes fly7 {
          0% {
            transform: translate3d(18vw, -15vh, 0)
              scale(1.35) rotate(0deg);
          }
          20% {
            transform: translate3d(-85vw, 30vh, 0)
              scale(1.6) rotate(105deg);
          }
          40% {
            transform: translate3d(-40vw, 85vh, 0)
              scale(0.62) rotate(200deg);
          }
          60% {
            transform: translate3d(30vw, 70vh, 0)
              scale(1.7) rotate(295deg);
          }
          80% {
            transform: translate3d(-20vw, 0, 0)
              scale(0.65) rotate(380deg);
          }
          100% {
            transform: translate3d(18vw, -15vh, 0)
              scale(1.35) rotate(470deg);
          }
        }

        @keyframes fly8 {
          0% {
            transform: translate3d(-18vw, 10vh, 0)
              scale(0.65) rotate(0deg);
          }
          20% {
            transform: translate3d(85vw, -65vh, 0)
              scale(1.7) rotate(-110deg);
          }
          40% {
            transform: translate3d(95vw, 20vh, 0)
              scale(0.58) rotate(-210deg);
          }
          60% {
            transform: translate3d(45vw, 70vh, 0)
              scale(1.65) rotate(-305deg);
          }
          80% {
            transform: translate3d(0, 35vh, 0)
              scale(0.62) rotate(-395deg);
          }
          100% {
            transform: translate3d(-18vw, 10vh, 0)
              scale(0.65) rotate(-485deg);
          }
        }

        @keyframes morph1 {
          0% {
            border-radius: 25% 75% 80% 20% /
              35% 25% 75% 65%;
          }
          33% {
            border-radius: 82% 18% 30% 70% /
              20% 82% 18% 80%;
          }
          66% {
            border-radius: 18% 82% 76% 24% /
              78% 20% 80% 22%;
          }
          100% {
            border-radius: 72% 28% 18% 82% /
              28% 76% 24% 72%;
          }
        }

        @keyframes morph2 {
          0% {
            border-radius: 80% 20% 32% 68% /
              20% 78% 22% 80%;
          }
          33% {
            border-radius: 20% 80% 78% 22% /
              82% 18% 76% 24%;
          }
          66% {
            border-radius: 75% 25% 20% 80% /
              25% 82% 18% 75%;
          }
          100% {
            border-radius: 28% 72% 82% 18% /
              76% 22% 78% 24%;
          }
        }

        @keyframes morph3 {
          0% {
            border-radius: 22% 78% 82% 18% /
              75% 20% 80% 25%;
          }
          33% {
            border-radius: 82% 18% 22% 78% /
              18% 80% 20% 82%;
          }
          66% {
            border-radius: 25% 75% 70% 30% /
              82% 28% 72% 18%;
          }
          100% {
            border-radius: 76% 24% 18% 82% /
              22% 75% 25% 78%;
          }
        }

        @media (max-width: 640px) {
          .blob {
            width: 78%;
            height: 64%;
            filter: blur(38px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .blob {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
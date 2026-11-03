import { OG_COLORS as C } from "../tokens";
import type { FicheA4Data } from "./data";
import { Heading } from "./FicheA4Criteria";
import { Panel, small } from "./FicheA4Panel";
import { treatPanels } from "./FicheA4Treat";
import { u } from "./scale";

// @cdc lot 6 — fiche A4 (PDF), bas de page à hauteur fixe : matière sèche, alternatives
// partenaires sous 55/100 (sinon la ration), QR code vers la fiche en ligne, crédits.
// Friandise : nombre par jour et recettes maison à la place (lib/og/fiche/FicheA4Treat.tsx).
// Hauteurs fixes : la position du QR code sert au lien cliquable du PDF (QR_LINK).

const PAGE = { width: 827, height: 1170, padX: 34, padBottom: 24 };
const FOOTER_H = 36;
const ROW_H = 152;
const GAP = 13;
const QR_W = 150;

/** Zone du QR code en fraction de la page (origine en haut à gauche), pour le lien du PDF. */
export const QR_LINK = {
  x: (PAGE.width - PAGE.padX - QR_W) / PAGE.width,
  y: (PAGE.height - PAGE.padBottom - FOOTER_H - GAP - ROW_H) / PAGE.height,
  width: QR_W / PAGE.width,
  height: ROW_H / PAGE.height,
};

function completePanels(d: FicheA4Data) {
  return [
    <Panel key="sec" width={210}>
      <Heading>Sur matière sèche</Heading>
      {d.dryMatter.map((r) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: u(11),
          }}
        >
          <span style={{ fontWeight: 500, color: C.ink2 }}>{r.label}</span>
          <span style={{ fontWeight: 700 }}>{r.value}</span>
        </div>
      ))}
      <span style={{ ...small, fontSize: u(8.5) }}>{d.dryMatterNote}</span>
    </Panel>,
    d.alternatives.length > 0 ? (
      <Panel key="alt">
        <Heading>Par quoi les remplacer ?</Heading>
        {d.alternatives.map((a) => (
          <div
            key={a.name}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <span
              style={{ fontWeight: 700, fontSize: u(10.5) }}
            >{`${a.name} · ${a.url}`}</span>
            <span style={small}>{a.reason}</span>
          </div>
        ))}
        <span style={{ ...small, fontSize: u(8.5) }}>
          Marques partenaires du site. La note de cette fiche n&apos;en dépend
          pas.
        </span>
      </Panel>
    ) : (
      <Panel key="ration" bg={C.amberBg}>
        <Heading>Combien lui en donner ?</Heading>
        <span style={{ ...small, fontSize: u(10.5) }}>
          {`La ration dépend du poids, de l'âge, de l'activité et de l'énergie de ${d.these}. Calcule-la en grammes par jour : toutou-gourmet.com/outils/ration`}
        </span>
      </Panel>
    ),
  ];
}

export function FicheA4Bottom({ d }: { d: FicheA4Data }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: u(GAP),
        marginTop: "auto",
      }}
    >
      <div style={{ display: "flex", gap: u(10), height: u(ROW_H) }}>
        {d.treat ? treatPanels(d.treat) : completePanels(d)}
        <Panel width={QR_W}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: u(4),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og : next/image indisponible */}
            <img src={d.qr} width={u(96)} height={u(96)} alt="" />
            <span
              style={{
                ...small,
                fontWeight: 700,
                color: C.ink,
                textAlign: "center",
              }}
            >
              Scanne pour ouvrir la fiche en ligne
            </span>
          </div>
        </Panel>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: u(2),
          height: u(FOOTER_H),
          borderTop: `${u(1)}px solid ${C.line}`,
          paddingTop: u(6),
          fontSize: u(8.5),
          color: C.ink2,
        }}
      >
        <span style={{ fontWeight: 700, color: C.ink }}>{d.credit}</span>
        <span style={{ fontWeight: 500 }}>
          Méthode et sources : toutou-gourmet.com/scanner. Cette fiche juge la
          composition, elle ne remplace pas l&apos;avis d&apos;un vétérinaire.
        </span>
      </div>
    </div>
  );
}

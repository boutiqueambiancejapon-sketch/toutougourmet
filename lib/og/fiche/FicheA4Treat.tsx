import { OG_COLORS as C } from "../tokens";
import type { FicheA4Data } from "./data";
import { Heading } from "./FicheA4Criteria";
import { Panel, small } from "./FicheA4Panel";
import { u } from "./scale";

// @cdc lot 6 — fiche A4 (PDF) d'une friandise : alertes de sécurité sous le verdict, et en bas
// de page le nombre de friandises par jour (10 % de l'apport calorique, FEDIAF) et, sous 55/100,
// nos recettes maison (pas de marque partenaire de friandises).

type Treat = NonNullable<FicheA4Data["treat"]>;

export function TreatAlertsA4({ alerts }: { alerts: Treat["alerts"] }) {
  if (alerts.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: u(4),
        background: C.roseBg,
        border: `${u(2)}px solid ${C.roseInk}`,
        borderRadius: u(10),
        padding: `${u(8)}px ${u(12)}px`,
        color: C.roseInk,
      }}
    >
      <span
        style={{ fontFamily: "Fraunces", fontWeight: 900, fontSize: u(13) }}
      >
        {alerts.length > 1
          ? `${alerts.length} ingrédients à risque pour le chien`
          : "Un ingrédient à risque pour le chien"}
      </span>
      {alerts.map((a) => (
        <span
          key={a.label}
          style={{ fontWeight: 500, fontSize: u(10.5), lineHeight: 1.35 }}
        >
          <span style={{ fontWeight: 700 }}>{`${a.label}.\u00a0`}</span>
          {a.text}
        </span>
      ))}
    </div>
  );
}

/** Deux encadrés en tableau (next/og ne met pas en page les fragments comme des enfants directs). */
export function treatPanels(t: Treat) {
  return [
    <Panel key="jour" width={250}>
      <Heading>Par jour, au plus</Heading>
      {t.perDay.map((r) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: u(6),
            fontSize: u(11),
          }}
        >
          <span style={{ fontWeight: 500, color: C.ink2 }}>{r.label}</span>
          <span style={{ fontWeight: 700 }}>{r.value}</span>
        </div>
      ))}
      <span style={{ ...small, fontSize: u(8.5) }}>{t.perDayNote}</span>
    </Panel>,
    <Panel key="maison" bg={C.amberBg}>
      <Heading>
        {t.homemade ? "Par quoi la remplacer ?" : "Une friandise, pas un repas"}
      </Heading>
      <span style={{ ...small, fontSize: u(10.5) }}>
        {t.homemade ??
          "Elle complète la ration sans la remplacer. Les calories des friandises se retirent de la ration du jour : calcule-la sur toutou-gourmet.com/outils/ration"}
      </span>
    </Panel>,
  ];
}

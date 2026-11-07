import * as React from "react"
import { ShieldCheckIcon, TrendingDownIcon, XIcon } from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

import {
  actionsForRisk,
  impactLabels,
  initials,
  likelihoodLabels,
  riskBand,
  riskScore,
  risks as initialRisks,
  type Risk,
} from "./data"
import { actionStageStyles, severityCells, severityStyles } from "./status"

const views = ["Residual", "Inherent"] as const

const scale = [1, 2, 3, 4, 5]

export default function SafetyRiskPage() {
  const [params, setParams] = useSearchParams()
  const [risks, setRisks] = React.useState<Risk[]>(initialRisks)
  const [view, setView] = React.useState<(typeof views)[number]>("Residual")
  const [cell, setCell] = React.useState<string | null>(null)

  const selectedId = params.get("risk")
  const selected = risks.find((risk) => risk.id === selectedId) ?? null

  function position(risk: Risk) {
    return view === "Residual"
      ? { likelihood: risk.residualLikelihood, impact: risk.residualImpact }
      : { likelihood: risk.likelihood, impact: risk.impact }
  }

  function score(risk: Risk) {
    const { likelihood, impact } = position(risk)
    return riskScore(likelihood, impact)
  }

  const inCell = (risk: Risk, likelihood: number, impact: number) => {
    const p = position(risk)
    return p.likelihood === likelihood && p.impact === impact
  }

  const listed = cell
    ? risks.filter((risk) => {
        const [likelihood, impact] = cell.split(":").map(Number)
        return inCell(risk, likelihood, impact)
      })
    : [...risks].sort((a, b) => score(b) - score(a))

  function select(id: string | null) {
    setParams(id ? { risk: id } : {}, { replace: true })
  }

  function rescore(id: string, field: keyof Risk, value: number) {
    setRisks((prev) =>
      prev.map((risk) => (risk.id === id ? { ...risk, [field]: value } : risk))
    )
  }

  let cellLabel: string | null = null
  if (cell) {
    const [likelihood, impact] = cell.split(":").map(Number)
    cellLabel = `${likelihoodLabels[likelihood - 1]} × ${impactLabels[impact - 1]}`
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Risk Analysis</h2>
          <p className="text-sm text-muted-foreground">
            {risks.length} assessed hazards ·{" "}
            {risks.filter((risk) => score(risk) >= 15).length} critical after
            controls
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (!value) return
            setView(value as (typeof views)[number])
            setCell(null)
          }}
          variant="outline"
          size="sm"
        >
          {views.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-4 @3xl/main:grid-cols-[minmax(0,380px)_minmax(0,1fr)] @3xl/main:items-start">
        <Card className="@3xl/main:sticky @3xl/main:top-4">
          <CardHeader>
            <CardTitle>{view} risk matrix</CardTitle>
            <CardDescription>
              Select a cell to filter the register.
            </CardDescription>
            {cell && (
              <CardAction>
                <Button size="sm" variant="ghost" onClick={() => setCell(null)}>
                  Clear
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="flex gap-2">
            <span className="rotate-180 self-center text-[10px] tracking-wide text-muted-foreground uppercase [writing-mode:vertical-rl]">
              Impact
            </span>
            <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[1.25rem_repeat(5,minmax(0,1fr))] gap-1">
            {[...scale].reverse().map((impact) => (
              <React.Fragment key={impact}>
                <div className="flex items-center justify-end pr-1 text-[10px] text-muted-foreground tabular-nums">
                  {impact}
                </div>
                {scale.map((likelihood) => {
                  const band = riskBand(riskScore(likelihood, impact))
                  const key = `${likelihood}:${impact}`
                  const hits = risks.filter((risk) =>
                    inCell(risk, likelihood, impact)
                  )
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCell(cell === key ? null : key)}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border border-transparent text-sm transition-all",
                        severityCells[band],
                        cell === key && "border-foreground ring-2 ring-foreground/20",
                        hits.length === 0 && "opacity-40"
                      )}
                      aria-label={`Likelihood ${likelihood}, impact ${impact}, ${hits.length} risks`}
                    >
                      <span className="text-base font-semibold tabular-nums">
                        {hits.length || ""}
                      </span>
                      <span className="text-[10px] opacity-70 tabular-nums">
                        {likelihood * impact}
                      </span>
                    </button>
                  )
                })}
              </React.Fragment>
            ))}
            <div />
            {scale.map((likelihood) => (
              <div
                key={likelihood}
                className="pt-1 text-center text-[10px] text-muted-foreground tabular-nums"
              >
                {likelihood}
              </div>
            ))}
          </div>
              <p className="mt-1 text-center text-[10px] tracking-wide text-muted-foreground uppercase">
                Likelihood
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 text-[11px] text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Likelihood</p>
                  {likelihoodLabels.map((label, index) => (
                    <p key={label}>
                      {index + 1} · {label}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-medium text-foreground">Impact</p>
                  {impactLabels.map((label, index) => (
                    <p key={label}>
                      {index + 1} · {label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk register</CardTitle>
            <CardDescription>
              {cell
                ? `${listed.length} risk(s) at ${cellLabel}`
                : `Sorted by ${view.toLowerCase()} score`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {listed.map((risk) => {
              const value = score(risk)
              return (
                <button
                  key={risk.id}
                  type="button"
                  onClick={() => select(risk.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
                    risk.id === selectedId &&
                      "border-primary ring-2 ring-primary/20"
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(risk.owner)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {risk.hazard}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {risk.id} · {risk.site} · {risk.category}
                    </span>
                  </span>
                  <Badge
                    variant="secondary"
                    className={severityStyles[riskBand(value)]}
                  >
                    {value}
                  </Badge>
                </button>
              )
            })}
            {listed.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No risks in this cell.
              </p>
            )}
          </CardContent>
        </Card>

      </div>

      <Drawer
        direction="right"
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) select(null)
        }}
      >
        <DrawerContent className="sm:max-w-md">
          {selected && (
            <RiskDetail
              risk={selected}
              view={view}
              onRescore={(field, value) => rescore(selected.id, field, value)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function RiskDetail({
  risk,
  view,
  onRescore,
}: {
  risk: Risk
  view: (typeof views)[number]
  onRescore: (field: keyof Risk, value: number) => void
}) {
  const residual = view === "Residual"
  const currentScore = residual
    ? riskScore(risk.residualLikelihood, risk.residualImpact)
    : riskScore(risk.likelihood, risk.impact)
  const reduction =
    riskScore(risk.likelihood, risk.impact) -
    riskScore(risk.residualLikelihood, risk.residualImpact)
  const linked = actionsForRisk(risk.id)

  return (
    <>
      <DrawerHeader className="gap-1 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <DrawerDescription>
              {risk.id} · {risk.site}
            </DrawerDescription>
            <DrawerTitle className="text-base">{risk.hazard}</DrawerTitle>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="secondary"
              className={severityStyles[riskBand(currentScore)]}
            >
              {currentScore}
            </Badge>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <XIcon />
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-1 text-sm">
          <Row label="Category" value={risk.category} />
          <Row label="Activity" value={risk.activity} />
          <Row label="Owner" value={risk.owner} />
          <Row label="Last reviewed" value={risk.reviewedOn} />
          <Row label="Next review" value={risk.nextReview} />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {view} scoring
          </p>
          <ScaleControl
            label="Likelihood"
            value={residual ? risk.residualLikelihood : risk.likelihood}
            onChange={(value) =>
              onRescore(residual ? "residualLikelihood" : "likelihood", value)
            }
          />
          <ScaleControl
            label="Impact"
            value={residual ? risk.residualImpact : risk.impact}
            onChange={(value) =>
              onRescore(residual ? "residualImpact" : "impact", value)
            }
          />
          <div className="flex items-center justify-between rounded-xl border p-3">
            <span className="flex items-center gap-2 text-sm">
              <TrendingDownIcon className="size-4 text-muted-foreground" />
              Control effectiveness
            </span>
            <span className="text-sm font-medium tabular-nums">
              −{reduction} points
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Controls in place
          </p>
          {risk.controls.map((control) => (
            <p key={control} className="flex items-start gap-2 text-sm">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
              {control}
            </p>
          ))}
        </div>

        {linked.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Linked actions
              </p>
              {linked.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2 rounded-lg border p-2"
                >
                  <span className="flex-1 text-xs">{action.title}</span>
                  <Badge
                    variant="secondary"
                    className={actionStageStyles[action.stage]}
                  >
                    {action.stage}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <DrawerFooter className="border-t">
        <Button
          size="sm"
          onClick={() =>
            toast.success(`${risk.id} reassessed`, {
              description: `${view} score is now ${currentScore} (${riskBand(
                currentScore
              )})`,
            })
          }
        >
          Save assessment
        </Button>
      </DrawerFooter>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function ScaleControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-xs">
          {label === "Likelihood"
            ? likelihoodLabels[value - 1]
            : impactLabels[value - 1]}
        </span>
      </div>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(next) => next && onChange(Number(next))}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {scale.map((step) => (
          <ToggleGroupItem
            key={step}
            value={String(step)}
            className="flex-1"
            aria-label={`${label} ${step}`}
          >
            {step}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

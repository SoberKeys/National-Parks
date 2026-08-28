import 'server-only'
import { feature, mesh } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import statesTopo from 'us-atlas/states-10m.json'
import { usPath } from '@/lib/map-projection'

/**
 * US outline as SVG path strings, computed on the server so topojson and the
 * atlas never reach the client bundle.
 *
 * Source: us-atlas, derived from US Census Bureau cartographic boundary files
 * (public domain).
 */
const topo = statesTopo as unknown as Topology<{
  states: GeometryCollection
  nation: GeometryCollection
}>

let cached: { nation: string; stateLines: string } | null = null

export function usOutline() {
  if (cached) return cached
  const path = usPath()
  const nation = feature(topo, topo.objects.nation)
  const stateLines = mesh(topo, topo.objects.states, (a, b) => a !== b)
  cached = {
    nation: path(nation as never) ?? '',
    stateLines: path(stateLines as never) ?? '',
  }
  return cached
}

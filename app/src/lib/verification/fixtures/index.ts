/**
 * Track fixtures.
 *
 * These are hand-built to match the SHAPES that real exporters produce —
 * namespaced extensions, differing creator strings, TCX trackpoints without a
 * position, route-only files. They are not real recordings.
 *
 * Testing against genuinely real exports from at least three physical devices
 * remains a launch-readiness item (docs/validation/calendar.md, B5). Shapes we
 * have not seen are exactly where a parser fails, and a participant who cannot
 * upload after travelling to a park is the worst failure this prototype has.
 */

/** Garmin-style: namespaced extensions, elevation and timestamps present. */
export const GARMIN_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Garmin Connect" version="1.1"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <metadata><time>2026-05-14T12:00:00.000Z</time></metadata>
  <trk>
    <name>Morning Run</name>
    <trkseg>
      <trkpt lat="44.3386" lon="-68.2733">
        <ele>12.2</ele><time>2026-05-14T12:00:00.000Z</time>
        <extensions><ns3:TrackPointExtension><ns3:hr>128</ns3:hr></ns3:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="44.3396" lon="-68.2733">
        <ele>18.4</ele><time>2026-05-14T12:00:30.000Z</time>
      </trkpt>
      <trkpt lat="44.3406" lon="-68.2733">
        <ele>15.1</ele><time>2026-05-14T12:01:00.000Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`

/** Strava-style: no namespace prefixes, multiple segments. */
export const STRAVA_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="StravaGPX" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>Zion</name>
    <trkseg>
      <trkpt lat="37.2000" lon="-113.0260"><ele>1180.0</ele><time>2026-05-14T13:00:00Z</time></trkpt>
      <trkpt lat="37.2010" lon="-113.0260"><ele>1181.0</ele><time>2026-05-14T13:00:20Z</time></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="37.2020" lon="-113.0260"><ele>1182.0</ele><time>2026-05-14T13:00:40Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`

/** Phone-app style: no elevation, no timestamps at all. */
export const MINIMAL_GPX = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><trkseg>
    <trkpt lat="38.5200" lon="-78.4400"/>
    <trkpt lat="38.5210" lon="-78.4400"/>
    <trkpt lat="38.5220" lon="-78.4400"/>
  </trkseg></trk>
</gpx>`

/** A planned route rather than a recording — accepted, but flagged. */
export const ROUTE_ONLY_GPX = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <rte><name>Planned</name>
    <rtept lat="44.3386" lon="-68.2733"/>
    <rtept lat="44.3396" lon="-68.2733"/>
  </rte>
</gpx>`

/** One point carries impossible coordinates; the rest of the file is fine. */
export const BAD_POINT_GPX = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><trkseg>
    <trkpt lat="44.3386" lon="-68.2733"><time>2026-05-14T12:00:00Z</time></trkpt>
    <trkpt lat="999" lon="-68.2733"><time>2026-05-14T12:00:10Z</time></trkpt>
    <trkpt lat="44.3396" lon="-68.2733"><time>2026-05-14T12:00:20Z</time></trkpt>
    <trkpt lat="" lon=""><time>2026-05-14T12:00:30Z</time></trkpt>
  </trkseg></trk>
</gpx>`

/** Watch export: TCX with an indoor trackpoint that has no position. */
export const TCX = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>2026-05-14T12:00:00Z</Id>
      <Lap StartTime="2026-05-14T12:00:00Z">
        <Track>
          <Trackpoint>
            <Time>2026-05-14T12:00:00Z</Time>
            <Position><LatitudeDegrees>44.3386</LatitudeDegrees><LongitudeDegrees>-68.2733</LongitudeDegrees></Position>
            <AltitudeMeters>12.2</AltitudeMeters>
          </Trackpoint>
          <Trackpoint>
            <Time>2026-05-14T12:00:20Z</Time>
          </Trackpoint>
          <Trackpoint>
            <Time>2026-05-14T12:00:40Z</Time>
            <Position><LatitudeDegrees>44.3396</LatitudeDegrees><LongitudeDegrees>-68.2733</LongitudeDegrees></Position>
            <AltitudeMeters>18.4</AltitudeMeters>
          </Trackpoint>
        </Track>
      </Lap>
    </Activity>
  </Activities>
  <Author><Name>Forerunner</Name></Author>
</TrainingCenterDatabase>`

/** A summary export with no track points at all. */
export const EMPTY_GPX = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>Summary</name></metadata>
</gpx>`

/** Truncated mid-download. */
export const TRUNCATED_GPX = `<gpx version="1.1"><trk><trkseg><trkpt lat="44.3" lon="-68.2">`

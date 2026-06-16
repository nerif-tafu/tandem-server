import { useCallback, useEffect, useRef, useState } from 'react';

import {

  Room,

  RoomEvent,

  Track,

  type RemoteParticipant,

  type RemoteTrack,

  type RemoteTrackPublication,

} from 'livekit-client';



import type { StreamSlot, ViewerResolution } from '@tandem/shared';



import { applyViewerResolution } from '../lib/apply-viewer-resolution';

import { fetchMediaToken } from '../lib/media-token';



export function useLiveKitViewer(

  roomCode: string | null,

  participantId: string | null,

  enabled: boolean,

  resolution: ViewerResolution,

  activePublisherId: string | null,

) {

  const [tracks, setTracks] = useState<Partial<Record<StreamSlot, RemoteTrack>>>({});

  const publicationsRef = useRef<Map<string, RemoteTrackPublication>>(new Map());

  const tracksByPublisherRef = useRef<Map<string, Partial<Record<StreamSlot, RemoteTrack>>>>(new Map());

  const resolutionRef = useRef(resolution);

  const activePublisherIdRef = useRef(activePublisherId);



  resolutionRef.current = resolution;

  activePublisherIdRef.current = activePublisherId;



  const syncDisplayedTracks = useCallback((): void => {

    const activeId = activePublisherIdRef.current;

    if (!activeId) {

      setTracks({});

      return;

    }



    setTracks({ ...(tracksByPublisherRef.current.get(activeId) ?? {}) });

  }, []);



  useEffect(() => {

    if (!enabled || !roomCode || !participantId) {

      setTracks({});

      publicationsRef.current.clear();

      tracksByPublisherRef.current.clear();

      return;

    }



    const room = new Room({ adaptiveStream: false });



    const storeTrack = (

      publisherId: string,

      slot: StreamSlot,

      track: RemoteTrack,

      publication: RemoteTrackPublication,

    ): void => {

      const publisherTracks = tracksByPublisherRef.current.get(publisherId) ?? {};

      publisherTracks[slot] = track;

      tracksByPublisherRef.current.set(publisherId, publisherTracks);



      const publicationKey = `${publisherId}:${slot}`;

      publicationsRef.current.set(publicationKey, publication);



      if (publisherId === activePublisherIdRef.current) {

        applyViewerResolution(publication, resolutionRef.current);

      }



      syncDisplayedTracks();

    };



    const removeTrack = (publisherId: string, slot: StreamSlot): void => {

      const publisherTracks = tracksByPublisherRef.current.get(publisherId);

      if (publisherTracks) {

        delete publisherTracks[slot];

        tracksByPublisherRef.current.set(publisherId, publisherTracks);

      }



      publicationsRef.current.delete(`${publisherId}:${slot}`);

      syncDisplayedTracks();

    };



    room.on(RoomEvent.TrackSubscribed, (track, publication, participant: RemoteParticipant) => {

      if (track.kind !== Track.Kind.Video || !publication.trackName) {

        return;

      }



      storeTrack(participant.identity, publication.trackName as StreamSlot, track, publication);

    });



    room.on(RoomEvent.TrackUnsubscribed, (_track, publication, participant: RemoteParticipant) => {

      if (!publication.trackName) {

        return;

      }



      removeTrack(participant.identity, publication.trackName as StreamSlot);

    });



    let cancelled = false;



    void (async () => {

      try {

        const { token, url } = await fetchMediaToken(roomCode, participantId, 'viewer');

        if (cancelled) {

          return;

        }



        await room.connect(url, token, {

          peerConnectionTimeout: 30_000,

          rtcConfig: {

            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],

          },

        });

      } catch (error) {

        console.error('LiveKit viewer connect failed', error);

      }

    })();



    return () => {

      cancelled = true;

      void room.disconnect();

      publicationsRef.current.clear();

      tracksByPublisherRef.current.clear();

      setTracks({});

    };

  }, [roomCode, participantId, enabled, syncDisplayedTracks]);



  useEffect(() => {

    syncDisplayedTracks();

  }, [activePublisherId, syncDisplayedTracks]);



  useEffect(() => {

    const activeId = activePublisherIdRef.current;

    if (!activeId) {

      return;

    }



    for (const [key, publication] of publicationsRef.current.entries()) {

      if (!key.startsWith(`${activeId}:`)) {

        continue;

      }



      applyViewerResolution(publication, resolution);

    }

  }, [resolution]);



  return { tracks };

};



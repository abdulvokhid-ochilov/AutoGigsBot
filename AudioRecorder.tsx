import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record';

export const AudioRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const micRef = useRef<HTMLDivElement>(null);
  const waveSurfer = useRef<WaveSurfer | null>(null);
  const record = useRef<RecordPlugin | null>(null);

  useEffect(() => {
    waveSurfer.current = WaveSurfer.create({
      container: micRef.current,
      waveColor: '#6978EB',
      height: 40,
      barWidth: 3,
    });

    return () => waveSurfer.current?.destroy();
  }, []);

  useEffect(() => {
    record.current = waveSurfer.current.registerPlugin(RecordPlugin.create());
    if (record.current) {
      // Handle record-end event
      record.current.on('record-end', (blob) => {
        const recordedUrl = URL.createObjectURL(blob);
        console.log(recordedUrl);
      });
    }
  }, [waveSurfer]);

  const handleRecordClick = async () => {
    if (!waveSurfer.current) return;

    if (record.current.isRecording()) {
      // Stop recording
      record.current.stopRecording();
    } else {
      // Start recording
      record.current.startRecording();
      setRecording(true);
    }
  };

  return (
    <div className="w-full h-full">
      {/* <button id="record" onClick={handleRecordClick}>
        {recording ? 'Stop' : 'Record'}
      </button> */}
      <div
        ref={micRef}
        // style={{
        //   border: '1px solid #ddd',
        //   borderRadius: '4px',
        //   marginTop: '1rem',
        // }}
      ></div>
      {/* <div id="recordings" style={{ margin: '1rem 0' }}></div> */}
    </div>
  );
};

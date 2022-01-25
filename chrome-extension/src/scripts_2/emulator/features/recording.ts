import * as h from "../../common/helpers";
import g from "../../common/globals";
import * as ebml from "ts-ebml";
import EBMLDecoder from "ts-ebml/lib/EBMLDecoder";
import EBMLEncoder from "ts-ebml/lib/EBMLEncoder";

let recorder: MediaRecorder = null;

export function toggleRecord(): (event: MouseEvent) => void {
  return h.toggleButton("recordingState", {}, () => stop(g.stream), runRecording);
}

export function startRecording(stream: MediaStream): Promise<Blob[]> {
  recorder = new MediaRecorder(stream);
  let data: Blob[] = [];

  recorder.ondataavailable = (event: BlobEvent) => data.push(event.data);
  recorder.start();

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event: MediaRecorderErrorEvent) => reject("Error stopping recorder");
  });

  return stopped.then(() => data);
}

export function stop(stream: MediaStream): void {
  if (recorder) {
    recorder.state == "recording" && recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 *
 * @param inputBlob Blob representing a video that is currently not seekable.
 * @param callback
 */
/* export function getSeekableBlob(inputBlob: Blob, callback: (blob: Blob) => any) {
  let reader: EBMLReader = new ebml.Reader();
  let decoder: EBMLDecoder = new ebml.Decoder();
  let tools = ebml.tools;

  let fileReader: FileReader = new FileReader();
  fileReader.onload = function () {
    let ebmlElms: ebml.EBMLElementDetail[] = decoder.decode(this.result as ArrayBuffer);
    ebmlElms.forEach(function (element) {
      reader.read(element);
    });
    reader.stop();
    let refinedMetadataBuf: ArrayBuffer = tools.makeMetadataSeekable(
      reader.metadatas,
      reader.duration,
      reader.cues
    );
    let body: ArrayBuffer = this.result.slice(reader.metadataSize) as ArrayBuffer;
    let newBlob: Blob = new Blob([refinedMetadataBuf, body], {
      type: "video/mp4",
    });
    callback(newBlob);
  };
  fileReader.readAsArrayBuffer(inputBlob);
} */

export function runRecording() {
  navigator.mediaDevices
    .getDisplayMedia({
      video: true,
      audio: false,
    })
    .then((stm: MediaStream) => {
      g.stream = stm;
      g.logs = [];
      g.start = Date.now();
      return startRecording(stm);
    })
    .then((recordedChunks: Blob[]) => {
      //let decoder: EBMLDecoder = new ebml.Decoder();
      //let encoder: EBMLEncoder = new ebml.Encoder();
      /* let blob = new Blob(recordedChunks, { type: "video/webm" });
      
      blob.arrayBuffer().then((buf) => {
        let seekableBlobBuf = encoder.encode(decoder.decode(buf));
        let seekableBlob = new Blob([new Uint8Array(seekableBlobBuf)], { type: "video/webm" })
        g.downloadButton.href = URL.createObjectURL(seekableBlob);
        g.downloadButton.download = "RecordedVideo.mp4";
        g.downloadButton.style.display = "flex";

        let logBlob = new Blob(g.logs, { type: "text/plain;charset=utf-8" });
        g.logButton.href = URL.createObjectURL(logBlob);
        g.logButton.download = "logs.txt";
        g.logButton.style.display = "flex";

        g.recordingState = false;
        h.setState();
      }) */
      
      /* getSeekableBlob(new Blob(recordedChunks, { type: "video/webm" }), (seekableBlob: Blob) => {
        g.downloadButton.href = URL.createObjectURL(seekableBlob);
        g.downloadButton.download = "RecordedVideo.mp4";
        g.downloadButton.style.display = "flex";

        let logBlob = new Blob(g.logs, { type: "text/plain;charset=utf-8" });
        g.logButton.href = URL.createObjectURL(logBlob);
        g.logButton.download = "logs.txt";
        g.logButton.style.display = "flex";

        g.recordingState = false;
        h.setState();
      }); */
    })
    .catch(() => {
      let button: HTMLAnchorElement = document.getElementById(
        "toggle-recording"
      ) as HTMLAnchorElement;
      button.style.color = "#000000";
      button.style.backgroundColor = "#FFFFFF";
      g.recordingState = false;
      h.setState();
    });
}

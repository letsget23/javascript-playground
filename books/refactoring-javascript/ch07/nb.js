var classifier = {
  songs: [],
  allChords: new Set(),
  labelCounts: new Map(),
  labelProbabilities: new Map(),
  chordCountsInLabels: new Map(),
  probabilityOfChordsInLabels: new Map()
};

function setDifficulties() {
  easy = "easy";
  medium = "medium";
  hard = "hard";
}

function setSongs() {
  imagine = ["c", "cmaj7", "f", "am", "dm", "g", "e7"];
  somewhereOverTheRainbow = ["c", "em", "f", "g", "am"];
  tooManyCooks = ["c", "g", "f"];
  iWillFollowYouIntoTheDark = ["f", "dm", "bb", "c", "a", "bbm"];
  babyOneMoreTime = ["cm", "g", "bb", "eb", "fm", "ab"];
  creep = ["g", "gsus4", "b", "bsus4", "c", "cmsus4", "cm6"];
  paperBag = [
    "bm7",
    "e",
    "c",
    "g",
    "b7",
    "f",
    "em",
    "a",
    "cmaj7",
    "em7",
    "a7",
    "f7",
    "b"
  ];
  toxic = ["cm", "eb", "g", "cdim", "eb7", "d7", "db7", "ab", "gmaj7", "g7"];
  bulletproof = ["d#m", "g#", "b", "f#", "g#m", "c#"];
}

function train(chords, label) {
  classifier.songs.push({
    label,
    chords
  });
  chords.forEach(chord => classifier.allChords.add(chord));
  if (Array.from(classifier.labelCounts.keys()).includes(label)) {
    classifier.labelCounts.set(label, classifier.labelCounts.get(label) + 1);
  } else {
    classifier.labelCounts.set(label, 1);
  }
}

function setLabelProbabilities() {
  classifier.labelCounts.forEach(function(_count, label) {
    classifier.labelProbabilities.set(
      label,
      classifier.labelCounts.get(label) / classifier.songs.length
    );
  });
}

function setChordCountsInLabels() {
  classifier.songs.forEach(function(song) {
    if (classifier.chordCountsInLabels.get(song.label) === undefined) {
      classifier.chordCountsInLabels.set(song.label, {});
    }
    song.chords.forEach(function(chord) {
      if (classifier.chordCountsInLabels.get(song.label)[chord] > 0) {
        classifier.chordCountsInLabels.get(song.label)[chord] += 1;
      } else {
        classifier.chordCountsInLabels.get(song.label)[chord] = 1;
      }
    });
  });
}

function setProbabilityOfChordsInLabels() {
  classifier.probabilityOfChordsInLabels = classifier.chordCountsInLabels;
  classifier.probabilityOfChordsInLabels.forEach(function(_chords, difficulty) {
    Object.keys(classifier.probabilityOfChordsInLabels.get(difficulty)).forEach(
      function(chord) {
        classifier.probabilityOfChordsInLabels.get(difficulty)[chord] /=
          classifier.songs.length;
      }
    );
  });
}

function classify(chords) {
  var smoothing = 1.01;
  var classified = new Map();
  // console.log(classifier.labelProbabilities);
  classifier.labelProbabilities.forEach(function(_probabilities, difficulty) {
    var first = classifier.labelProbabilities.get(difficulty) + smoothing;
    chords.forEach(function(chord) {
      var probabilityOfChordInLabel = classifier.probabilityOfChordsInLabels.get(
        difficulty
      )[chord];
      if (probabilityOfChordInLabel) {
        first = first * (probabilityOfChordInLabel + smoothing);
      }
    });
    classified.set(difficulty, first);
  });

  // console.log(classified);
  return classified;
}

function trainAll() {
  setDifficulties();
  setSongs();
  train(imagine, easy);
  train(somewhereOverTheRainbow, easy);
  train(tooManyCooks, easy);
  train(iWillFollowYouIntoTheDark, medium);
  train(babyOneMoreTime, medium);
  train(creep, medium);
  train(paperBag, hard);
  train(toxic, hard);
  train(bulletproof, hard);
  setLabelsAndProbabilities();
}

function setLabelsAndProbabilities() {
  setLabelProbabilities();
  setChordCountsInLabels();
  setProbabilityOfChordsInLabels();
}

module.exports = {
  classify,
  labelProbabilities,
  trainAll
};

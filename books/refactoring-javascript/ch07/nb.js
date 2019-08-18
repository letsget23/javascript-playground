const songList = {
  songs: [],
  difficulties: ["easy", "medium", "hard"],
  addSong: function(name, chords, difficulty) {
    this.songs.push({
      name,
      chords,
      difficulty: this.difficulties[difficulty]
    });
  }
};

const classifier = {
  songs: [],
  allChords: new Set(),
  labelCounts: new Map(),
  labelProbabilities: new Map(),
  chordCountsInLabels: new Map(),
  probabilityOfChordsInLabels: new Map(),
  smoothing: 1.01,
  classify: function(chords) {
    // console.log(classifier.labelProbabilities);
    return new Map(
      Array.from(this.labelProbabilities.entries()).map(
        labelWithProbability => {
          const difficulty = labelWithProbability[0];
          const totalLikelihood = chords.reduce((total, chord) => {
            const probabilityOfChordInLabel = this.probabilityOfChordsInLabels.get(
              difficulty
            )[chord];
            if (probabilityOfChordInLabel) {
              return total * (probabilityOfChordInLabel + this.smoothing);
            } else {
              return total;
            }
          }, this.labelProbabilities.get(difficulty) + this.smoothing);

          return [difficulty, totalLikelihood];
        }
      )
    );
  }
};

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

function trainAll() {
  songList.songs.forEach(function(song) {
    train(song.chords, song.difficulty);
  });
  setLabelsAndProbabilities();
}

function setLabelsAndProbabilities() {
  setLabelProbabilities();
  setChordCountsInLabels();
  setProbabilityOfChordsInLabels();
}

module.exports = {
  classifier: classifier,
  labelProbabilities,
  trainAll,
  songList
};

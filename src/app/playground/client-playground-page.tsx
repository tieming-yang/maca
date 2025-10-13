const fakeData =
  "描いた夢とここにある今\n二つの景色見比べても\n形を変えてここにあるのは\n確かな一つのもの\n過ぎゆく春を星見ながらも\n僕らの幕開けたあの夏";

export default function ClientPlaygroundPage() {
  return (
    <main className="flex w-full h-full flex-col justify-center items-center space-y-10">
      <h1>here is the playground</h1>
      <ul>
        {fakeData.split("\n").map((line, idx) => {
          return (
            <li key={idx}>
              <p className="">{line}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

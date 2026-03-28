const commandSamples = [
  'terraform apply && helm upgrade --install',
  'teamcity build --project live-release --watch',
  'ansible-playbook infra/hardening.yml --check',
  'kubectl rollout status deploy/pipeline-orchestrator',
];

export function initTypewriter(targetElement) {
  if (!targetElement) {
    return;
  }

  let commandIndex = 0;
  let typedTextIndex = 0;
  let erasing = false;

  const loop = () => {
    const activeCommand = commandSamples[commandIndex];

    if (!erasing) {
      targetElement.textContent = activeCommand.slice(0, typedTextIndex + 1);
      typedTextIndex += 1;

      if (typedTextIndex === activeCommand.length) {
        erasing = true;
        setTimeout(loop, 1400);
        return;
      }

      setTimeout(loop, 42);
      return;
    }

    targetElement.textContent = activeCommand.slice(0, typedTextIndex - 1);
    typedTextIndex -= 1;

    if (typedTextIndex === 0) {
      erasing = false;
      commandIndex = (commandIndex + 1) % commandSamples.length;
      setTimeout(loop, 260);
      return;
    }

    setTimeout(loop, 22);
  };

  loop();
}

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export function substituteVariables(
  text: string,
  environment: Environment | null
): string {
  if (!environment) return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return environment.variables[trimmedName] || match;
  });
}

export function processRequest(
  request: {
    url: string;
    headers: Record<string, string>;
    body?: string;
  },
  environment: Environment | null
): {
  url: string;
  headers: Record<string, string>;
  body?: string;
} {
  if (!environment) return request;

  return {
    url: substituteVariables(request.url, environment),
    headers: Object.fromEntries(
      Object.entries(request.headers).map(([key, value]) => [
        substituteVariables(key, environment),
        substituteVariables(value, environment),
      ])
    ),
    body: request.body ? substituteVariables(request.body, environment) : undefined,
  };
}

export function highlightVariables(text: string): string {
  return text.replace(
    /\{\{([^}]+)\}\}/g,
    '<span class="text-blue-600 font-mono bg-blue-50 px-1 rounded">{{$1}}</span>'
  );
}

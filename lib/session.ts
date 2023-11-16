export function getSession({ name }: { name: string }) {
  return localStorage.getItem(name)
    ? JSON.parse(localStorage.getItem(name) as string)
    : [];
}

export function setSession({ name, value }: { name: string; value: any }) {
  const existingStorageData = getSession({ name });

  const newData = [...existingStorageData, value];

  localStorage.setItem(name, JSON.stringify(newData));

  return newData;
}

export function deleteSession({ name }: { name: string }) {
  localStorage.removeItem(name);
}

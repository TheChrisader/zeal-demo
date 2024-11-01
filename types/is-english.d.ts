declare module "is-english" {
  export default function isEnglish(
    text: string,
    options?: { threshold: number },
  ): boolean;
}

import { Notebook } from '../../components/Notebook';

export const dynamicParams = false;

export function generateStaticParams() {
  return [['log'], ['active'], ['victory'], ['coach'], ['history'], ['profile']].map((route) => ({ route }));
}

export default function Page() {
  return <Notebook />;
}

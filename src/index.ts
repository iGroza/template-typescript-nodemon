import 'dotenv/config';
import { main } from './app';

main().catch((err) => console.error('🔴 main error', err))

export default interface OptionsI {
    environment: 'default' | string;
    'timestamp-shift': number;
    'daemon-info': 'off' | 'summary' | 'full';
    length: number;
    machine: boolean;
    'full-msg': boolean;
}
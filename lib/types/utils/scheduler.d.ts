declare class Scheduler {
    private observer;
    private listener;
    stopped: boolean;
    constructor();
    private run;
    schedule(): void;
    get scheduled(): boolean;
}
declare const scheduler: Scheduler;
export { scheduler };
